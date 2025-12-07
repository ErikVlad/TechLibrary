'use client';

import { useState, useEffect } from 'react';
import SidebarLayout from '@/components/main-block/sidebar/SidebarLayout';
import FiltersSidebar from '@/components/books/FiltersSidebar/FiltersSidebar';
import BookGrid from '@/components/books/BookGrid/BookGrid';
import { Book } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import styles from './page.module.css';

export default function LiteraturePage() {
  console.log('🚀 LiteraturePage: Начало рендера');
  
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка книг
  useEffect(() => {
    console.log('📚 LiteraturePage: Загрузка началась');
    
    let mounted = true;
    
    const loadBooks = async () => {
      try {
        console.log('🔍 LiteraturePage: Запрос к Supabase');
        const { data, error: supabaseError } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) {
          console.error('❌ LiteraturePage: Ошибка Supabase:', supabaseError);
          throw supabaseError;
        }

        console.log('✅ LiteraturePage: Получено книг:', data?.length || 0);
        
        if (mounted) {
          if (!data || data.length === 0) {
            console.log('📭 LiteraturePage: Нет книг в базе');
            setBooks([]);
            setError('Нет книг в базе данных.');
          } else {
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
            
            console.log('💾 LiteraturePage: Устанавливаю книги в состояние');
            setBooks(booksData);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ LiteraturePage: Ошибка загрузки:', error);
        if (mounted) {
          setError('Ошибка загрузки книг');
          setLoading(false);
        }
      }
    };

    loadBooks();
    
    return () => {
      console.log('🧹 LiteraturePage: Очистка эффекта');
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
    booksCount: books.length,
    error
  });

  return (
    <SidebarLayout
      filters={
        <FiltersSidebar
          books={books}
          onFilterChange={() => {}} // Пустая функция
        />
      }
    >
      <div className={styles.booksSection}>
        <div className={styles.booksHeader}>
          <h1>Каталог технической литературы</h1>
          <p className={styles.booksCount}>
            Книг в базе: <span>{books.length}</span>
          </p>
        </div>

        {error ? (
          <div className={styles.errorContainer}>
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>Загрузка книг...</p>
          </div>
        ) : books.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fas fa-database"></i>
            <h3>База данных пуста</h3>
            <p>Добавьте книги через админ-панель Supabase</p>
          </div>
        ) : (
          <BookGrid 
            books={books} 
            onBookSelect={handleBookSelect}
          />
        )}
      </div>
    </SidebarLayout>
  );
}
