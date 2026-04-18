"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";

type AuthContextType = {
  user: User | null;
  cargo: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, cargo: null, loading: true });

const CARGO_KEY = "pce_cargo";

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

function lerCargoCache(): string | null {
  try { return localStorage.getItem(CARGO_KEY); } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [cargo, setCargo]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router   = useRouter();
  const pathname = usePathname();

  const persistCargo = (c: string | null) => {
    setCargo(c);
    try { c ? localStorage.setItem(CARGO_KEY, c) : localStorage.removeItem(CARGO_KEY); } catch {}
  };

  const fetchCargo = async (uid: string) => {
    const { data } = await supabase.from("perfis").select("cargo").eq("id", uid).single();
    persistCargo(data?.cargo?.toLowerCase().trim() ?? null);
  };

  useEffect(() => {
    const cachedUser  = lerSessaoCache();
    const cachedCargo = lerCargoCache();

    if (cachedUser && cachedCargo) {
      // Tudo em cache → UI instantânea, cargo disponível imediatamente
      setUser(cachedUser);
      setCargo(cachedCargo);
      setLoading(false);
      // Atualiza cargo e valida sessão em background
      fetchCargo(cachedUser.id);
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.user) { persistCargo(null); setUser(null); }
      });
    } else {
      // Sem cache completo: aguarda uma vez (primeira visita ou após logout)
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) await fetchCargo(u.id);
        else persistCargo(null);
        setLoading(false);
      });
    }

    // Ouve login / logout — ignora INITIAL_SESSION (tratado acima)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "INITIAL_SESSION") return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) await fetchCargo(u.id);
      else persistCargo(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== "/login") router.push("/login");
      if (user && pathname === "/login") router.push("/activities");
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, cargo, loading }}>
      {loading ? (
        <div style={{
          display: "flex", height: "100vh",
          justifyContent: "center", alignItems: "center",
          background: "#0f172a", color: "#00ff99",
        }}>
          Carregando Portal...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
