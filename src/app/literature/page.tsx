'use client';

import { useState, useEffect, useRef } from 'react';
import SidebarLayout from '@/components/main-block/sidebar/SidebarLayout';
import FiltersSidebar from '@/components/books/FiltersSidebar/FiltersSidebar';
import BookGrid from '@/components/books/BookGrid/BookGrid';
import { Book, Filters } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import styles from './page.module.css';

export default function LiteraturePage() {
  console.log('🚀 LiteraturePage: Рендер');
  
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Используем ref для предотвращения повторной загрузки
  const hasLoadedBooksRef = useRef(false);

  // Загрузка книг - один раз при монтировании
  useEffect(() => {
    console.log('📚 LiteraturePage: useEffect начался');
    
    // Если уже загружали книги, выходим
    if (hasLoadedBooksRef.current) {
      console.log('📚 LiteraturePage: Книги уже загружены, пропускаю');
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    
    const loadBooks = async () => {
      try {
        console.log('🔍 LiteraturePage: Запрос к Supabase');
        const { data } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('✅ LiteraturePage: Получено книг:', data?.length || 0);
        
        if (isMounted && data && data.length > 0) {
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
          setFilteredBooks(booksData);
          hasLoadedBooksRef.current = true; // Помечаем как загруженные
        }
      } catch (error) {
        console.error('❌ LiteraturePage: Ошибка загрузки:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('🏁 LiteraturePage: Загрузка завершена');
        }
      }
    };

    loadBooks();
    
    return () => {
      console.log('🧹 LiteraturePage: Очистка эффекта');
      isMounted = false;
    };
  }, []); // Пустой массив - только при монтировании

  // Функция фильтрации (простая)
  const filterBooks = (booksList: Book[], filters: Filters): Book[] => {
    if (!booksList || booksList.length === 0) return [];
    
    let filtered = [...booksList];

    // Поиск
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(book => 
        (book.title?.toLowerCase().includes(searchLower)) ||
        (book.author?.toLowerCase().includes(searchLower))
      );
    }

    // Категории
    if (filters.categories?.length > 0) {
      filtered = filtered.filter(book => 
        book.category && filters.categories.includes(book.category)
      );
    }

    // Год
    if (filters.year && filters.year !== 'all') {
      switch (filters.year) {
        case '2025':
          filtered = filtered.filter(book => book.year === 2025);
          break;
        case '2024':
          filtered = filtered.filter(book => book.year === 2024);
          break;
        case '2023-2021':
          filtered = filtered.filter(book => book.year >= 2021 && book.year <= 2023);
          break;
        case 'old':
          filtered = filtered.filter(book => book.year < 2021);
          break;
      }
    }

    return filtered;
  };

  // Обработчик фильтров
  const handleFilterChange = (filters: Filters) => {
    console.log('🔧 LiteraturePage: Получены фильтры');
    const filtered = filterBooks(books, filters);
    setFilteredBooks(filtered);
  };

  const handleBookSelect = (book: Book) => {
    if (book.pdf_url && book.pdf_url !== '#') {
      window.open(book.pdf_url, '_blank');
    }
  };

  console.log('📊 LiteraturePage: Статус', {
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
      <div className={styles.booksSection}>
        <div className={styles.booksHeader}>
          <h1>Каталог технической литературы</h1>
          <p className={styles.booksCount}>
            Показано: <span>{filteredBooks.length}</span> из <span>{books.length}</span> книг
          </p>
        </div>

        {loading ? (
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
        ) : filteredBooks.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fas fa-filter"></i>
            <h3>Книги не найдены</h3>
            <p>Попробуйте изменить параметры поиска или сбросить фильтры</p>
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
