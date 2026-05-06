"use client";

import {
  createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";

type AuthContextType = {
  user:    User | null;
  cargo:   string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null, cargo: null, loading: true,
});

const CARGO_KEY = "pce_cargo";

/**
 * Lê o objeto de sessão do Supabase diretamente do localStorage de forma
 * síncrona, sem aguardar a Promise de getSession(). Usado para exibir a UI
 * instantaneamente em visitas repetidas quando o token ainda é válido.
 */
function lerSessaoCache(): User | null {
  try {
    const chave = Object.keys(localStorage).find(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
    );
    if (!chave) return null;
    const stored = JSON.parse(localStorage.getItem(chave) || "null");
    if (stored?.user?.id) return stored.user as User;
  } catch {}
  return null;
}

/**
 * Lê o cargo salvo no localStorage. Persiste entre recarregamentos para
 * que componentes como o Navbar saibam o cargo antes mesmo da query ao BD.
 */
function lerCargoCache(): string | null {
  try { return localStorage.getItem(CARGO_KEY); } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [cargo,   setCargo]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const router   = useRouter();
  const pathname = usePathname();

  // Mantém o último uid para o qual já buscamos cargo, evitando fetch
  // duplicado em eventos como TOKEN_REFRESHED que só renovam o token.
  const cargoFetchedFor = useRef<string | null>(null);

  /** Atualiza o cargo no estado React e no localStorage. Null limpa o cache. */
  const persistCargo = (c: string | null) => {
    setCargo(c);
    try {
      c ? localStorage.setItem(CARGO_KEY, c) : localStorage.removeItem(CARGO_KEY);
    } catch {}
  };

  /** Busca o cargo do usuário na tabela `perfis` do Supabase e persiste. */
  const fetchCargo = async (uid: string) => {
    if (cargoFetchedFor.current === uid) return;
    cargoFetchedFor.current = uid;
    const { data } = await supabase
      .from("perfis")
      .select("cargo")
      .eq("id", uid)
      .single();
    persistCargo(data?.cargo?.toLowerCase().trim() ?? null);
  };

  useEffect(() => {
    const cachedUser  = lerSessaoCache();
    const cachedCargo = lerCargoCache();

    if (cachedUser && cachedCargo) {
      setUser(cachedUser);
      setCargo(cachedCargo);
      setLoading(false);
      cargoFetchedFor.current = cachedUser.id;

      // Revalida em background: se a sessão expirou, derruba o estado.
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.user) {
          cargoFetchedFor.current = null;
          persistCargo(null);
          setUser(null);
        }
      });
    } else {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) await fetchCargo(u.id);
        else { cargoFetchedFor.current = null; persistCargo(null); }
        setLoading(false);
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // INITIAL_SESSION: já tratado acima
        // TOKEN_REFRESHED / USER_UPDATED: token renovado mas sem mudança real
        // de identidade — não recarrega cargo nem força re-render dos consumidores.
        if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;

        const u = session?.user ?? null;

        // Se o uid não mudou, nada precisa atualizar (USER_UPDATED de e-mail etc.)
        if (u?.id && u.id === cargoFetchedFor.current) return;

        setUser(u);
        if (u) await fetchCargo(u.id);
        else { cargoFetchedFor.current = null; persistCargo(null); }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user && pathname !== "/login") router.push("/login");
    if (user  && pathname === "/login") router.push("/activities");
  }, [user, loading, pathname, router]);

  // Memoiza o objeto de contexto para que consumidores só re-renderizem
  // quando user/cargo/loading mudarem de fato.
  const value = useMemo<AuthContextType>(
    () => ({ user, cargo, loading }),
    [user, cargo, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{
          display: "flex", height: "100vh",
          justifyContent: "center", alignItems: "center",
          background: "#0f172a", color: "#22c55e",
        }}>
          Carregando Portal...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

/** Hook para consumir o contexto de autenticação em qualquer componente */
export const useAuth = () => useContext(AuthContext);
