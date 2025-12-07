// app/literature/page.tsx
'use client';

import { useState, useEffect } from 'react';
// Временно используем SimpleLayout
import SimpleLayout from '@/components/main-block/sidebar/SimpleLayout';
import { Book } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';

export default function LiteraturePage() {
  console.log('🚀 LiteraturePage: Начало рендера');
  
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('📚 LiteraturePage: Загрузка началась');
    
    let mounted = true;
    
    const loadBooks = async () => {
      try {
        console.log('🔍 LiteraturePage: Запрос к Supabase');
        const { data } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('✅ LiteraturePage: Получено книг:', data?.length || 0);
        
        if (mounted) {
          if (data && data.length > 0) {
            const booksData: Book[] = data.map(book => ({
              id: book.id,
              title: book.title,
              author: book.author,
              description: book.description || '',
              year: book.year,
              pages: book.pages,
              pdf_url: book.pdf_url || '#',
              category: book.category || 'Не указана',
              tags: book.tags || [],
              created_at: book.created_at,
              updated_at: book.updated_at
            }));
            
            console.log('💾 LiteraturePage: Устанавливаю книги');
            setBooks(booksData);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ LiteraturePage: Ошибка:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBooks();
    
    return () => {
      console.log('🧹 LiteraturePage: Очистка');
      mounted = false;
    };
  }, []);

  const handleBookSelect = (book: Book) => {
    if (book.pdf_url && book.pdf_url !== '#') {
      window.open(book.pdf_url, '_blank');
    }
  };

  console.log('🔄 LiteraturePage: Конец рендера', {
    loading,
    booksCount: books.length
  });

  return (
    <SimpleLayout
      filters={
        <div style={{ padding: '10px', backgroundColor: '#e8f4f8' }}>
          <h3>Фильтры (упрощенные)</h3>
          <p>Книг доступно: {books.length}</p>
        </div>
      }
    >
      <div style={{ padding: '20px' }}>
        <h1>Каталог технической литературы</h1>
        <p>Книг в базе: <strong>{books.length}</strong></p>

        {loading ? (
          <div>Загрузка книг...</div>
        ) : books.length === 0 ? (
          <div>Нет книг в базе</div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            {books.map(book => (
              <div 
                key={book.id}
                style={{
                  padding: '15px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <h3 style={{ marginTop: 0 }}>{book.title}</h3>
                <p><strong>Автор:</strong> {book.author}</p>
                <p><strong>Год:</strong> {book.year}</p>
                <button 
                  onClick={() => handleBookSelect(book)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Читать
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </SimpleLayout>
  );
}
