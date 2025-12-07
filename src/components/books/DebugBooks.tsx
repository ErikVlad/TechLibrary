// components/books/DebugBooks.tsx
'use client';

import { useState, useEffect } from 'react';
import { Book } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';

export default function DebugBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('🎯 DebugBooks: Компонент смонтирован');
    
    const loadBooks = async () => {
      console.log('📚 DebugBooks: Начинаю загрузку книг');
      const { data } = await supabase
        .from('books')
        .select('*')
        .limit(5);
      
      console.log('✅ DebugBooks: Книги загружены:', data?.length || 0);
      setBooks(data || []);
    };
    
    loadBooks();
    
    // Счетчик рендеров
    const timer = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);
    
    return () => {
      console.log('🔄 DebugBooks: Компонент размонтирован');
      clearInterval(timer);
    };
  }, []);
  
  console.log('🔄 DebugBooks: Рендер #' + count, 'Книг:', books.length);
  
  return (
    <div style={{ padding: '20px', border: '2px solid red' }}>
      <h3>Отладка ({count}):</h3>
      <p>Книг загружено: {books.length}</p>
      <ul>
        {books.map(book => (
          <li key={book.id}>{book.title}</li>
        ))}
      </ul>
    </div>
  );
}
