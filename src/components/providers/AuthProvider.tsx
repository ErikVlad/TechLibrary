'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';

interface SignInResponse {
  data: { user: User | null; session: Session | null };
  error: AuthError | null;
}

interface SignUpResponse {
  data: { user: User | null; session: Session | null };
  error: AuthError | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<SignInResponse>;
  signUp: (email: string, password: string, name: string) => Promise<SignUpResponse>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const createProfileIfNotExists = useCallback(async (user: User) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (createError) {
          console.error('Ошибка создания профиля:', createError);
        }
      }
    } catch (error) {
      console.error('Ошибка в createProfileIfNotExists:', error);
    }
  }, []);

  useEffect(() => {
    // Проверяем активную сессию
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await createProfileIfNotExists(session.user);
      }
      
      setLoading(false);
    });

    // Слушаем изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await createProfileIfNotExists(session.user);
        }
        
        if (event === 'SIGNED_OUT') {
          // Очищаем localStorage при выходе
          localStorage.removeItem('sb-auth-token');
          localStorage.removeItem('supabase.auth.token');
          router.push('/');
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [router, createProfileIfNotExists]);

  const signIn = async (email: string, password: string): Promise<SignInResponse> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data?.user && !error) {
      await createProfileIfNotExists(data.user);
    }

    return { data, error };
  };

  const signUp = async (email: string, password: string, name: string): Promise<SignUpResponse> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      }
    });

    if (data?.user && !error) {
      try {
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: name || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
      } catch (profileErr) {
        console.error('Ошибка создания профиля:', profileErr);
      }
    }

    return { data, error };
  };

  const signOut = async () => {
    try {
      // Используем scope: 'local' для предотвращения 403 ошибки
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        console.error('Ошибка при выходе:', error);
        // Если стандартный выход не работает, очищаем вручную
        localStorage.removeItem('sb-auth-token');
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('sb-auth-token');
        sessionStorage.removeItem('supabase.auth.token');
      }
      
      // В любом случае сбрасываем состояние
      setUser(null);
      setSession(null);
      
    } catch (err) {
      console.error('Критическая ошибка при выходе:', err);
      // Принудительная очистка
      localStorage.removeItem('sb-auth-token');
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('sb-auth-token');
      sessionStorage.removeItem('supabase.auth.token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
