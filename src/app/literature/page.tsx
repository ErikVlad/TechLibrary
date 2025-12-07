// app/literature/page.tsx
'use client';

import { useState, useEffect } from 'react';
import SidebarLayout from '@/components/main-block/sidebar/SidebarLayout';
import FiltersSidebar from '@/components/books/FiltersSidebar/FiltersSidebar';
import BookGrid from '@/components/books/BookGrid/BookGrid';
import { Book, Filters } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import DebugBooks from '@/components/books/DebugBooks';
import styles from './page.module.css';

export default function LiteraturePage() {
  console.log('🚀 LiteraturePage: Начало рендера');
  
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка книг (только один раз)
  useEffect(() => {
    console.log('📚 LiteraturePage: useEffect запущен');
    
    let isMounted = true;
    
    const loadBooks = async () => {
      try {
        console.log('🔍 LiteraturePage: Запрос к Supabase');
        const { data } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('✅ LiteraturePage: Получено книг:', data?.length || 0);
        
        if (isMounted) {
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
            
            console.log('💾 LiteraturePage: Устанавливаю книги в состояние');
            setBooks(booksData);
            setFilteredBooks(booksData);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ LiteraturePage: Ошибка загрузки:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBooks();
    
    return () => {
      console.log('🧹 LiteraturePage: Очистка эффекта');
      isMounted = false;
    };
  }, []); // Пустой массив - только при монтировании

  // Простейший обработчик фильтров
  const handleFilterChange = (filters: Filters) => {
    console.log('🔧 LiteraturePage: Получены фильтры', filters);
    
    // Если фильтры не пустые - очищаем книги
    if (filters.search || 
        filters.categories.length > 0 || 
        filters.authors.length > 0 ||
        filters.tags.length > 0 ||
        filters.year !== 'all' ||
        filters.yearFrom ||
        filters.yearTo) {
      console.log('🎯 LiteraturePage: Фильтры не пустые - очищаю книги');
      setFilteredBooks([]);
    } else {
      console.log('🎯 LiteraturePage: Фильтры пустые - показываю все книги');
      setFilteredBooks(books);
    }
  };

  const handleBookSelect = (book: Book) => {
    if (book.pdf_url && book.pdf_url !== '#') {
      window.open(book.pdf_url, '_blank');
    }
  };

  console.log('🔄 LiteraturePage: Конец рендера', {
    loading,
    booksCount: books.length,
    filteredCount: filteredBooks.length
  });

  return (
    <SidebarLayout
      filters={
        <FiltersSidebar
          books={books}
          onFilterChange={handleFilterChange}
        />
      }
    >
      <DebugBooks />
      
      <div className={styles.booksSection}>
        <div className={styles.booksHeader}>
          <h1>Каталог технической литературы</h1>
          <p className={styles.booksCount}>
            Книг загружено: <span>{books.length}</span>, 
            Показано: <span>{filteredBooks.length}</span>
          </p>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>Загрузка книг...</p>
          </div>
        ) : (
          <BookGrid 
            books={filteredBooks} 
            onBookSelect={handleBookSelect}
          />
        )}
      </div>
    </SidebarLayout>
  );
}
