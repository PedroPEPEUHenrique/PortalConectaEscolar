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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cargo, setCargo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchCargo = async (uid: string) => {
    const { data } = await supabase
      .from("perfis")
      .select("cargo")
      .eq("id", uid)
      .single();
    setCargo(data?.cargo?.toLowerCase().trim() ?? null);
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user ?? null;
      setUser(u);
      if (u) await fetchCargo(u.id);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) await fetchCargo(u.id);
      else setCargo(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== "/login") {
        router.push("/login");
      }
      if (user && pathname === "/login") {
        router.push("/activities");
      }
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
