'use client';

import { useState, useEffect, useCallback } from 'react';
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

  // Функция фильтрации
  const filterBooks = useCallback((booksList: Book[], filters: Filters): Book[] => {
    if (!booksList || booksList.length === 0) return [];
    
    console.log('🔧 filterBooks: Начало фильтрации', {
      книгДо: booksList.length,
      фильтры: filters
    });
    
    let filtered = [...booksList];

    // Поиск
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(book => 
        (book.title?.toLowerCase().includes(searchLower)) ||
        (book.author?.toLowerCase().includes(searchLower)) ||
        (book.description?.toLowerCase().includes(searchLower))
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

    console.log('🔧 filterBooks: Конец фильтрации', {
      книгПосле: filtered.length
    });
    
    return filtered;
  }, []);

  // Загрузка книг
  useEffect(() => {
    console.log('📚 LiteraturePage: Начало загрузки книг');
    
    let isMounted = true;
    
    const loadBooks = async () => {
      try {
        const { data } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('✅ LiteraturePage: Книги получены:', data?.length || 0);
        
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
            
            setBooks(booksData);
            // ПОКАЗЫВАЕМ ВСЕ КНИГИ БЕЗ ФИЛЬТРАЦИИ
            setFilteredBooks(booksData);
            console.log('✅ LiteraturePage: Книги установлены:', booksData.length);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ LiteraturePage: Ошибка:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBooks();
    
    return () => {
      console.log('🧹 LiteraturePage: Очистка');
      isMounted = false;
    };
  }, []); // Только при монтировании

  // Обработчик фильтров
  const handleFilterChange = useCallback((filters: Filters) => {
    console.log('🔧 LiteraturePage: Получены фильтры от sidebar', filters);
    
    // Проверяем, пустые ли фильтры
    const isEmpty = !filters.search && 
                    filters.categories.length === 0 && 
                    filters.tags.length === 0 &&
                    filters.authors.length === 0 &&
                    filters.year === 'all' &&
                    !filters.yearFrom &&
                    !filters.yearTo;
    
    console.log('🔧 LiteraturePage: Фильтры пустые?', isEmpty);
    
    if (isEmpty) {
      // Показываем ВСЕ книги
      console.log('🔧 LiteraturePage: Показываю все книги');
      setFilteredBooks(books);
    } else {
      // Применяем фильтры
      const filtered = filterBooks(books, filters);
      console.log('🔧 LiteraturePage: Применяю фильтры, результат:', filtered.length);
      setFilteredBooks(filtered);
    }
  }, [books, filterBooks]);

  const handleBookSelect = (book: Book) => {
    if (book.pdf_url && book.pdf_url !== '#') {
      window.open(book.pdf_url, '_blank');
    }
  };

  console.log('🔄 LiteraturePage: Статус', {
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
            <span style={{ color: filteredBooks.length === 0 ? 'red' : 'inherit' }}>
              Показано: {filteredBooks.length}
            </span> из <span>{books.length}</span> книг
          </p>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>Загрузка книг...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fas fa-book-open"></i>
            <h3>Книги не найдены</h3>
            <p>Измените фильтры или нажмите "Сбросить"</p>
            <div style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
              <strong>Отладка:</strong> Загружено {books.length} книг, но фильтры скрыли все
            </div>
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
