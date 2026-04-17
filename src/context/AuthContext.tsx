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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]     = useState<User | null>(null);
  const [cargo, setCargo]   = useState<string | null>(null);
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
    // Lê cargo do cache imediatamente — visitas repetidas ficam prontas sem esperar rede
    try {
      const cached = localStorage.getItem(CARGO_KEY);
      if (cached) setCargo(cached);
    } catch {}

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const hasCached = (() => { try { return !!localStorage.getItem(CARGO_KEY); } catch { return false; } })();
        if (hasCached) {
          setLoading(false);       // desbloqueia UI imediatamente com o cache
          fetchCargo(u.id);        // valida em background sem travar a tela
        } else {
          await fetchCargo(u.id);  // primeira visita: aguarda uma vez só
          setLoading(false);
        }
      } else {
        persistCargo(null);
        setLoading(false);
      }
    });

    // Escuta login/logout — ignora INITIAL_SESSION (já tratado acima)
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
        <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center", background: "#0f172a", color: "#00ff99" }}>
          Carregando Portal...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
