import { createClient } from '@supabase/supabase-js';

// Используем модуль-синглтон
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    const supabaseUrl = 'https://vhrpcwukwyjtuikpoefz.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocnBjd3Vrd3lqdHVpa3BvZWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MTU5NTEsImV4cCI6MjA4MDI5MTk1MX0.HzpY3JHQEl5Cklo6Nr_iuehKMVCC4pw-y7PVn2pTOPY';
    
    console.log('Creating new Supabase instance...');
    
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'tech-library-auth',
        storage: typeof window !== 'undefined' ? localStorage : undefined,
        flowType: 'pkce',
        // Явно отключаем мульти-инстансы
        multiTab: false,
        lock: {
          acquireTimeout: 3000,
          retryInterval: 100,
          retryMax: 5
        }
      },
      global: {
        headers: {
          'x-client-info': 'tech-library-web',
          'x-client-version': '1.0.0'
        }
      }
    });
    
    // Для дебаггинга
    if (typeof window !== 'undefined') {
      // Проверяем, есть ли другие инстансы
      const checkInstances = () => {
        const keys = Object.keys(window.localStorage);
        const authKeys = keys.filter(key => key.includes('supabase.auth.token'));
        if (authKeys.length > 1) {
          console.warn(`Found multiple auth keys: ${authKeys.join(', ')}`);
          // Оставляем только наш ключ
          authKeys.forEach(key => {
            if (key !== 'tech-library-auth') {
              window.localStorage.removeItem(key);
            }
          });
        }
      };
      
      // Проверяем через 1 секунду после загрузки
      setTimeout(checkInstances, 1000);
    }
  }
  
  return supabaseInstance;
};

// Экспортируем синглтон
export const supabase = getSupabaseClient();
