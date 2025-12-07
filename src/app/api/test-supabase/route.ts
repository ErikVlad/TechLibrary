import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    // Тест подключения
    const { data, error } = await supabase.from('books').select('count').single();
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: 'Ошибка подключения к Supabase. Проверьте: 1) Ключи 2) RLS политики'
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase подключен успешно!',
      booksCount: data?.count || 0
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ 
      success: false, 
      error: err.message,
      details: 'Ошибка подключения'
    }, { status: 500 });
  }
}