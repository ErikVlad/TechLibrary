'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SidebarLayout from '@/components/main-block/sidebar/SidebarLayout';
import FiltersSidebar from '@/components/books/FiltersSidebar/FiltersSidebar';
import BookGrid from '@/components/books/BookGrid/BookGrid';
import { Book, Filters } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import styles from './page.module.css';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;
  const router = useRouter();
  
  // Получаем состояние авторизации из вашего контекста
  const { user, loading: authLoading } = useAuth();

  // Флаг для отслеживания монтирования компонента
  const isMounted = useRef(true);

  // Функция загрузки книг
  const loadBooks = useCallback(async () => {
    if (!isMounted.current) return;
    
    setLoadingBooks(true);
    console.log('Loading books, user:', user?.email || 'anon', 'authLoading:', authLoading);
    
    try {
      // Разные запросы в зависимости от авторизации
      let query = supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      // Если пользователь авторизован, можно добавить дополнительные условия
      if (user) {
        // query = query.or('is_public.eq.true,user_id.eq.' + user.id);
        // Или просто все книги для авторизованных
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (isMounted.current) {
        if (data && data.length > 0) {
          setBooks(data);
          setFilteredBooks(data);
          console.log(`Loaded ${data.length} books`);
        } else {
          // Используем демо-данные только если нет реальных
          const demoBooks: Book[] = [
            {
              id: '1',
              title: 'Современный JavaScript 2025',
              author: 'Алексей Петров',
              description: 'Полное руководство по современному JavaScript с примерами и лучшими практиками.',
              year: 2025,
              pages: 450,
              pdf_url: 'https://example.com/javascript-2025.pdf',
              category: 'Программирование',
              tags: ['JavaScript', 'ES2025', 'Frontend'],
              created_at: '2024-01-15',
              updated_at: '2024-01-15'
            },
            {
              id: '2',
              title: 'PostgreSQL для разработчиков',
              author: 'Мария Сидорова',
              description: 'Практическое руководство по работе с PostgreSQL от основ до продвинутых техник.',
              year: 2024,
              pages: 320,
              pdf_url: 'https://example.com/postgresql.pdf',
              category: 'Базы данных',
              tags: ['PostgreSQL', 'SQL', 'Базы данных'],
              created_at: '2024-02-20',
              updated_at: '2024-02-20'
            }
          ];
          setBooks(demoBooks);
          setFilteredBooks(demoBooks);
          console.log('Using demo books');
        }
      }
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      if (isMounted.current) {
        setLoadingBooks(false);
        console.log('Books loading finished');
      }
    }
  }, [user, authLoading]);

  // Инициализация компонента
  useEffect(() => {
    isMounted.current = true;
    
    console.log('HomePage mounted, authLoading:', authLoading);
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Загружаем книги при изменении авторизации
  useEffect(() => {
    if (!authLoading) {
      console.log('Auth initialized, loading books...');
      loadBooks();
    }
  }, [user, authLoading, loadBooks]);

  // Слушаем события авторизации напрямую через Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed from HomePage:', event);
        
        // Перезагружаем книги при изменении авторизации
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          console.log('Auth event triggered book reload');
          // Даем время для обновления состояния AuthProvider
          setTimeout(() => {
            if (isMounted.current) {
              loadBooks();
            }
          }, 500);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loadBooks]);

  // Функция фильтрации
  const applyFilters = useCallback((filters: Filters) => {
    let filtered = [...books];

    // Поиск
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower) ||
        (book.description && book.description.toLowerCase().includes(searchLower))
      );
    }

    // Категории
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(book => 
        book.category && filters.categories.includes(book.category)
      );
    }

    // Авторы
    if (filters.authors && filters.authors.length > 0) {
      filtered = filtered.filter(book => 
        book.author && filters.authors.includes(book.author)
      );
    }

    // Теги
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(book => 
        book.tags && book.tags.some((tag: string) => filters.tags.includes(tag))
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

    // Диапазон лет
    if (filters.yearFrom) {
      const yearFromNum = parseInt(filters.yearFrom);
      if (!isNaN(yearFromNum)) {
        filtered = filtered.filter(book => book.year >= yearFromNum);
      }
    }
    if (filters.yearTo) {
      const yearToNum = parseInt(filters.yearTo);
      if (!isNaN(yearToNum)) {
        filtered = filtered.filter(book => book.year <= yearToNum);
      }
    }

    setFilteredBooks(filtered);
    setCurrentPage(1);
  }, [books]);

  // Дебаунс функция
  const useDebounce = (callback: (filters: Filters) => void, delay: number) => {
    return useCallback((filters: Filters) => {
      const timeoutId = setTimeout(() => {
        callback(filters);
      }, delay);
      
      return () => clearTimeout(timeoutId);
    }, [callback, delay]);
  };

  // Дебаунс для фильтрации
  const debouncedHandleFilterChange = useDebounce(applyFilters, 300);

  const handleFilterChange = useCallback((filters: Filters) => {
    debouncedHandleFilterChange(filters);
  }, [debouncedHandleFilterChange]);

  const handleBookSelect = (book: Book) => {
    if (book.pdf_url) {
      window.open(book.pdf_url, '_blank');
    }
  };

  // Пагинация
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  // Если еще грузится авторизация
  if (authLoading) {
    return (
      <div className={styles.loadingState}>
        <div className="loading"></div>
        <p>Проверка авторизации...</p>
      </div>
    );
  }

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
          <div>
            <h1>Каталог технической литературы</h1>
            <p className={styles.booksCount}>
              {user && <span style={{ color: 'var(--accent)', marginRight: '10px' }}>
                👋 Привет, {user.email}
              </span>}
              Показано <span>{filteredBooks.length}</span> из <span>{books.length}</span> книг
            </p>
          </div>
        </div>

        {loadingBooks ? (
          <div className={styles.loadingState}>
            <div className="loading"></div>
            <p>Загрузка книг...</p>
          </div>
        ) : (
          <>
            {books.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fas fa-books" style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}></i>
                <h3>Книги не найдены</h3>
                <p>Попробуйте обновить страницу или проверить соединение с базой данных</p>
                {!user && (
                  <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    После авторизации могут появиться дополнительные книги
                  </p>
                )}
              </div>
            ) : (
              <>
                <BookGrid 
                  books={currentBooks} 
                  onBookSelect={handleBookSelect}
                />
                
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button 
                      className={styles.pageBtn}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          className={`${styles.pageBtn} ${currentPage === pageNum ? styles.active : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span style={{ color: 'var(--text-secondary)', padding: '0 0.5rem' }}>...</span>
                    )}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <button
                        className={styles.pageBtn}
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </button>
                    )}
                    
                    <button 
                      className={styles.pageBtn}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </SidebarLayout>
  );
}