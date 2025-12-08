import { createClient } from '@supabase/supabase-js';

// Создаем единый экземпляр клиента
const supabaseUrl = 'https://vhrpcwukwyjtuikpoefz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocnBjd3Vrd3lqdHVpa3BvZWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MTU5NTEsImV4cCI6MjA4MDI5MTk1MX0.HzpY3JHQEl5Cklo6Nr_iuehKMVCC4pw-y7PVn2pTOPY';

// Проверяем, не создан ли уже клиент в глобальном объекте
// Это предотвращает создание нескольких экземпляров
const globalSupabase = (globalThis as any).__supabase;

let supabase;

if (globalSupabase) {
  supabase = globalSupabase;
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'sb-auth-token'
    }
  });
  
  // Сохраняем в глобальном объекте для предотвращения дублирования
  if (typeof window !== 'undefined') {
    (globalThis as any).__supabase = supabase;
  }
}

export { supabase };
