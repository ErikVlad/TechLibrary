'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client'; // ИМПОРТ ИЗМЕНЕН
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ data: null, error: null }),
  signUp: async () => ({ data: null, error: null }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          console.log(`AuthProvider: ${event}`);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      setMounted(false);
      subscription.unsubscribe();
    };
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const result = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: name || '',
        }
      }
    });
    
    return result;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
