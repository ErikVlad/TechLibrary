'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [loadingBooks, setLoadingBooks] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const booksPerPage = 12;
  
  const { user, loading: authLoading } = useAuth();

  const isMounted = useRef<boolean>(true);
  const prevUserRef = useRef<string | null>(null);
  const authListenerSetRef = useRef<boolean>(false);

  // Функция для загрузки книг с правильной логикой авторизации
  const loadBooks = useCallback(async (userId: string | null = null) => {
    if (!isMounted.current) return;
    
    const currentUserId = userId || (user?.id || 'anon');
    
    // Если пользователь не изменился, не загружаем заново
    if (prevUserRef.current === currentUserId && books.length > 0) {
      console.log('User unchanged, skipping book reload');
      return;
    }
    
    console.log(`Loading books for user: ${currentUserId}`);
    setLoadingBooks(true);
    
    try {
      let query = supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Добавьте здесь логику для разных типов пользователей
      // Например, для анонимных пользователей только публичные книги
      // if (!user) {
      //   query = query.eq('is_public', true);
      // }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (isMounted.current) {
        if (data && data.length > 0) {
          setBooks(data);
          setFilteredBooks(data); // Сброс фильтров при загрузке новых книг
          setCurrentPage(1); // Сброс пагинации
          prevUserRef.current = currentUserId;
          console.log(`Loaded ${data.length} books`);
        } else {
          // Демо-данные
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
          prevUserRef.current = currentUserId;
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
  }, [user]);

  // Инициализация
  useEffect(() => {
    isMounted.current = true;
    console.log('HomePage mounted');
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Основная загрузка книг при монтировании
  useEffect(() => {
    if (!authLoading && isMounted.current) {
      console.log('Auth ready, loading books...');
      loadBooks();
    }
  }, [authLoading, loadBooks]);

  // Прямой слушатель событий авторизации (упрощенный)
  useEffect(() => {
    if (authListenerSetRef.current) return;
    
    console.log('Setting up auth listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`Auth event: ${event}`);
        
        if (!isMounted.current) return;
        
        // При входе/выходе обновляем книги
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          console.log(`Auth changed: ${event}, loading books...`);
          
          // Сбрасываем предыдущего пользователя
          prevUserRef.current = null;
          
          // Загружаем книги с небольшой задержкой
          setTimeout(() => {
            if (isMounted.current) {
              const userId = session?.user?.id || null;
              loadBooks(userId);
            }
          }, 100);
        }
      }
    );
    
    authListenerSetRef.current = true;
    
    return () => {
      subscription.unsubscribe();
      authListenerSetRef.current = false;
    };
  }, [loadBooks]);

  // При изменении пользователя сбрасываем состояние
  useEffect(() => {
    if (!authLoading) {
      const currentUserId = user?.id || 'anon';
      
      if (prevUserRef.current !== currentUserId) {
        console.log(`User changed from ${prevUserRef.current} to ${currentUserId}`);
        
        // Сбрасываем фильтры при смене пользователя
        setFilteredBooks(books);
        setCurrentPage(1);
        
        // Не загружаем книги снова, они уже загружены в loadBooks
      }
    }
  }, [user, authLoading, books]);

  // Функция фильтрации
  const applyFilters = useCallback((filters: Filters): void => {
    let filtered = [...books];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower) ||
        (book.description && book.description.toLowerCase().includes(searchLower))
      );
    }

    if (filters.categories?.length > 0) {
      filtered = filtered.filter(book => 
        book.category && filters.categories.includes(book.category)
      );
    }

    if (filters.authors?.length > 0) {
      filtered = filtered.filter(book => 
        book.author && filters.authors.includes(book.author)
      );
    }

    if (filters.tags?.length > 0) {
      filtered = filtered.filter(book => 
        book.tags && book.tags.some(tag => filters.tags.includes(tag))
      );
    }

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

  // Дебаунс для фильтрации
  const useDebounce = (callback: (filters: Filters) => void, delay: number) => {
    return useCallback((filters: Filters) => {
      const timeoutId = setTimeout(() => {
        callback(filters);
      }, delay);
      
      return () => clearTimeout(timeoutId);
    }, [callback, delay]);
  };

  const debouncedHandleFilterChange = useDebounce(applyFilters, 300);

  const handleFilterChange = useCallback((filters: Filters) => {
    debouncedHandleFilterChange(filters);
  }, [debouncedHandleFilterChange]);

  const handleBookSelect = (book: Book): void => {
    if (book.pdf_url) {
      window.open(book.pdf_url, '_blank');
    }
  };

  const resetFilters = (): void => {
    setFilteredBooks(books);
    setCurrentPage(1);
  };

  // Пагинация
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  // Если грузится авторизация
  if (authLoading) {
    return (
      <div className={styles.loadingState}>
        <div className="loading"></div>
        <p>Инициализация...</p>
      </div>
    );
  }

  return (
    <SidebarLayout
      filters={
        <FiltersSidebar
          books={books}
          onFilterChange={handleFilterChange}
          onResetFilters={resetFilters}
        />
      }
    >
      <div className={styles.booksSection}>
        <div className={styles.booksHeader}>
          <div>
            <h1>Каталог технической литературы</h1>
            <p className={styles.booksCount}>
              {user && (
                <span style={{ color: 'var(--accent)', marginRight: '10px' }}>
                  👋 Привет, {user.email}
                </span>
              )}
              Показано <span>{filteredBooks.length}</span> из <span>{books.length}</span> книг
              {(filteredBooks.length !== books.length) && (
                <button 
                  onClick={resetFilters}
                  className={styles.resetFiltersBtn}
                  style={{
                    marginLeft: '10px',
                    padding: '4px 8px',
                    background: 'var(--accent-light)',
                    color: 'var(--accent)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Сбросить фильтры
                </button>
              )}
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
                <p>Попробуйте обновить страницу</p>
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
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={styles.pageBtn}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
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
                          onClick={() => setCurrentPage(pageNum)}
                          className={`${styles.pageBtn} ${currentPage === pageNum ? styles.active : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={styles.pageBtn}
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
