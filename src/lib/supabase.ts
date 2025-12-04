import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vhrpcwukwyjtuikpoefz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocnBjd3Vrd3lqdHVpa3BvZWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MTU5NTEsImV4cCI6MjA4MDI5MTk1MX0.HzpY3JHQEl5Cklo6Nr_iuehKMVCC4pw-y7PVn2pTOPY'

// Клиент для клиентских компонентов
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
})