import { createClient } from '@supabase/supabase-js';

// Используем ваши реальные ключи
const supabaseUrl = 'https://vhrpcwukwyjtuikpoefz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocnBjd3Vrd3lqdHVpa3BvZWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MTU5NTEsImV4cCI6MjA4MDI5MTk1MX0.HzpY3JHQEl5Cklo6Nr_iuehKMVCC4pw-y7PVn2pTOPY';

// Создаем клиент
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// import { createBrowserClient } from '@supabase/ssr'

// export const createClient = () =>
//   createBrowserClient(
//     `https://vhrpcwukwyjtuikpoefz.supabase.co`,
//     `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocnBjd3Vrd3lqdHVpa3BvZWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MTU5NTEsImV4cCI6MjA4MDI5MTk1MX0.HzpY3JHQEl5Cklo6Nr_iuehKMVCC4pw-y7PVn2pTOPYsb_publishable_DBUAJOuDhefTfMM-JOJmdw_8T4hbE4K`
//   )