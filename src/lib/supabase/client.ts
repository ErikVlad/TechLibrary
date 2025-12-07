import { createClient } from '@supabase/supabase-js';

// Используем глобальную переменную для хранения единственного экземпляра
const globalSupabase = globalThis as unknown as {
  supabase?: ReturnType<typeof createClient>;
};

const supabaseUrl = 'https://vhrpcwukwyjtuikpoefz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocnBjd3Vrd3lqdHVpa3BvZWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MTU5NTEsImV4cCI6MjA4MDI5MTk1MX0.HzpY3JHQEl5Cklo6Nr_iuehKMVCC4pw-y7PVn2pTOPY';

// Создаем или возвращаем существующий клиент
export const supabase = globalSupabase.supabase || createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'tech-library-auth-token',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    flowType: 'pkce',
    multiTab: false // Отключаем поддержку нескольких вкладок
  },
  global: {
    headers: {
      'x-application-name': 'tech-library'
    }
  }
});

// Сохраняем в глобальной области для повторного использования
if (!globalSupabase.supabase) {
  globalSupabase.supabase = supabase;
}

export default supabase;
