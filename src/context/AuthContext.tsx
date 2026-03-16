"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";

// Definindo o que o nosso Contexto vai guardar
type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // Descobre em qual URL o usuário está agora

  useEffect(() => {
    // 1. Busca a sessão atual assim que o site carrega
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };
    getSession();

    // 2. Fica "escutando" mudanças (ex: quando o usuário clica em Entrar ou Sair)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. A Lógica do "Segurança da Porta" (Proteção de Rotas)
  useEffect(() => {
    if (!loading) {
      // Se NÃO tem usuário logado e ele NÃO está na tela de login, manda pro login
      if (!user && pathname !== "/login" && pathname !== "/cadastro") {
        router.push("/login");
      }
      
      // Se TEM usuário logado e ele tentar voltar pra tela de login, manda pras atividades
      if (user && pathname === "/login") {
        router.push("/activities");
      }
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {/* Exibe um carregamento rápido enquanto o Supabase verifica se o usuário existe,
          evitando que a tela protegida "pisque" antes de mandar pro login */}
      {loading ? (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#0f172a', color: '#00ff99' }}>
          Carregando Portal...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

// Hook personalizado para facilitar o uso em outras telas
export const useAuth = () => useContext(AuthContext);