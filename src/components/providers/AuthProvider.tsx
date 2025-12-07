// components/providers/AuthProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Используем ref вместо state для отслеживания инициализации
  const isInitializedRef = useRef(false);
  const skipNextAuthEventRef = useRef(false);

  // Функция для создания профиля если его нет
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
    console.log('🔄 AuthProvider: Инициализация началась');
    
    // Если уже инициализированы, выходим
    if (isInitializedRef.current) {
      console.log('🔄 AuthProvider: Уже инициализирован, пропускаю');
      return;
    }
    
    const initializeAuth = async () => {
      try {
        // Получаем текущую сессию
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔐 AuthProvider: Получена начальная сессия', session ? 'есть' : 'нет');
        
        // Устанавливаем состояние один раз
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 AuthProvider: Создаю профиль для начального пользователя');
          await createProfileIfNotExists(session.user);
        }
        
        // Помечаем как инициализированное
        isInitializedRef.current = true;
        
        // Пропускаем следующее событие INITIAL_SESSION
        skipNextAuthEventRef.current = true;
        
      } catch (error) {
        console.error('❌ AuthProvider: Ошибка инициализации:', error);
      } finally {
        setLoading(false);
        console.log('✅ AuthProvider: Инициализация завершена');
      }
    };

    initializeAuth();

    // Подписываемся на изменения состояния аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🎯 AuthProvider: Auth событие:', event, 'Пропускать?', skipNextAuthEventRef.current);
        
        // Пропускаем INITIAL_SESSION событие после начальной загрузки
        if (event === 'INITIAL_SESSION' && skipNextAuthEventRef.current) {
          console.log('🔄 AuthProvider: Пропускаем INITIAL_SESSION событие');
          skipNextAuthEventRef.current = false;
          return;
        }
        
        // Обновляем состояние только если пользователь действительно изменился
        const currentUserId = user?.id;
        const newUserId = session?.user?.id;
        
        if (currentUserId !== newUserId) {
          console.log('🔄 AuthProvider: Пользователь изменился', { 
            текущий: currentUserId, 
            новый: newUserId 
          });
          
          setSession(session);
          setUser(session?.user ?? null);
          
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('👤 AuthProvider: Создаю профиль для нового пользователя');
            await createProfileIfNotExists(session.user);
          }
          
          // Только при явном выходе и не на главной странице перенаправляем
          if (event === 'SIGNED_OUT' && pathname !== '/') {
            console.log('🚪 AuthProvider: Пользователь вышел, перенаправляю на главную');
            router.push('/');
          }
        } else {
          console.log('🔄 AuthProvider: Пользователь не изменился, пропускаю обновление');
        }
        
        setLoading(false);
      }
    );

    return () => {
      console.log('🧹 AuthProvider: Отписываемся от событий');
      subscription.unsubscribe();
    };
  }, [router, createProfileIfNotExists, pathname, user?.id]); // Добавили user?.id в зависимости

  const signIn = async (email: string, password: string): Promise<SignInResponse> => {
    console.log('🔑 AuthProvider: Попытка входа для', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data?.user && !error) {
      console.log('✅ AuthProvider: Успешный вход');
      await createProfileIfNotExists(data.user);
    } else if (error) {
      console.error('❌ AuthProvider: Ошибка входа:', error);
    }

    return { data, error };
  };

  const signUp = async (email: string, password: string, name: string): Promise<SignUpResponse> => {
    console.log('📝 AuthProvider: Регистрация для', email);
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
        console.log('✅ AuthProvider: Профиль создан');
      } catch (profileErr) {
        console.error('❌ AuthProvider: Ошибка создания профиля:', profileErr);
      }
    }

    return { data, error };
  };

  const signOut = async () => {
    console.log('🚪 AuthProvider: Выход пользователя');
    await supabase.auth.signOut();
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
