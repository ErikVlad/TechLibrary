// components/providers/AuthProvider.tsx
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

  // Функция для создания профиля если его нет (объявляем ДО использования)
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
    // Регистрируем пользователя
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    // Создаем профиль даже если email не подтвержден
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
    await supabase.auth.signOut();
    router.push('/');
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