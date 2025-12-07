'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import SidebarLayout from '@/components/main-block/sidebar/SidebarLayout';
import FiltersSidebar from '@/components/books/FiltersSidebar/FiltersSidebar';
import BookGrid from '@/components/books/BookGrid/BookGrid';
import { Book, Filters } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import styles from './page.module.css';

export default function LiteraturePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [filterResetKey, setFilterResetKey] = useState(0);
  const booksPerPage = 12;
  
  const prevUserRef = useRef<string | null>(null);

  // Загрузка текущего пользователя с сбросом фильтров при смене
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id || null;
      
      // Если пользователь изменился (вошёл или вышел), сбрасываем фильтры
      if (currentUserId !== prevUserRef.current) {
        console.log('Пользователь изменился, сбрасываем фильтры');
        setFilterResetKey(prev => prev + 1);
        prevUserRef.current = currentUserId;
        
        // Сбрасываем состояние книг
        setBooks([]);
        setFilteredBooks([]);
        setCurrentPage(1);
        setLoading(true);
      }
      
      setUser(user);
    };
    
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUserId = session?.user?.id || null;
      
      if (currentUserId !== prevUserRef.current) {
        console.log('Состояние аутентификации изменилось, сбрасываем фильтры');
        setFilterResetKey(prev => prev + 1);
        prevUserRef.current = currentUserId;
        
        // Сбрасываем состояние книг
        setBooks([]);
        setFilteredBooks([]);
        setCurrentPage(1);
        setLoading(true);
      }
      
      setUser(session?.user || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Загрузка книг из Supabase для пользователя:', user?.id || 'anonymous');
      
      // Добавляем задержку для демонстрации (можно убрать)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { data, error: supabaseError } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        console.error('Ошибка Supabase:', supabaseError);
        throw new Error(`Ошибка Supabase: ${supabaseError.message}`);
      }

      console.log('Данные получены из Supabase:', data?.length, 'книг');
      
      if (!data || data.length === 0) {
        console.log('В базе данных нет книг');
        setBooks([]);
        setFilteredBooks([]);
        setError('В базе данных пока нет книг. Добавьте книги через админ-панель Supabase.');
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
        
        console.log('Преобразованные книги:', booksData.length);
        setBooks(booksData);
        setFilteredBooks(booksData);
      }
    } catch (error) {
      console.error('Error loading books from Supabase:', error);
      const err = error as Error;
      setError(`Не удалось загрузить книги из базы данных: ${err.message}`);
      setBooks([]);
      setFilteredBooks([]);
    } finally {
      setLoading(false);
    }
  }, [user]); // Добавляем user в зависимости

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleFilterChange = useCallback((filters: Filters) => {
    let filtered = [...books];

    // Поиск по названию и автору
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower) ||
        book.description.toLowerCase().includes(searchLower)
      );
    }

    // Фильтр по категориям
    if (filters.categories.length > 0) {
      filtered = filtered.filter(book => 
        filters.categories.includes(book.category)
      );
    }

    // Фильтр по авторам
    if (filters.authors.length > 0) {
      filtered = filtered.filter(book => 
        filters.authors.includes(book.author)
      );
    }

    // Фильтр по тегам
    if (filters.tags.length > 0) {
      filtered = filtered.filter(book => 
        book.tags.some(tag => filters.tags.includes(tag))
      );
    }

    // Фильтр по году
    if (filters.year !== 'all') {
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

    // Фильтр по диапазону лет
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

  const handleBookSelect = (book: Book) => {
    if (book.pdf_url && book.pdf_url !== '#') {
      window.open(book.pdf_url, '_blank');
    } else {
      alert('Ссылка на PDF не указана для этой книги');
    }
  };

  // Пагинация
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  return (
    <SidebarLayout
      filters={
        <FiltersSidebar
          key={`${user?.id || 'anonymous'}-${filterResetKey}`} // Двойной ключ для гарантированного сброса
          books={books}
          onFilterChange={handleFilterChange}
          initialFilters={null} // Явно передаём null для сброса
        />
      }
    >
      <div className={styles.booksSection}>
        <div className={styles.booksHeader}>
          <div>
            <h1>Каталог технической литературы</h1>
            <p className={styles.booksCount}>
              {user ? `Привет, ${user.email}!` : 'Вы не авторизованы'} • 
              Показано <span>{filteredBooks.length}</span> из <span>{books.length}</span> книг
            </p>
          </div>
          <div className={styles.headerActions}>
            {user && (
              <button 
                className={styles.authBtn}
                onClick={async () => {
                  await supabase.auth.signOut();
                  // Фильтры сбросятся автоматически через onAuthStateChange
                }}
                title="Выйти из аккаунта"
              >
                <i className="fas fa-sign-out-alt"></i> Выйти
              </button>
            )}
            <button 
              className={styles.refreshBtn}
              onClick={loadBooks}
              disabled={loading}
              title="Обновить список книг"
            >
              <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
              {loading ? ' Загрузка...' : ' Обновить'}
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.errorContainer}>
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <div className={styles.errorActions}>
              <button onClick={loadBooks} className={styles.retryBtn}>
                Попробовать снова
              </button>
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.supabaseLink}
              >
                Открыть Supabase
              </a>
            </div>
          </div>
        )}

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>Загрузка книг из базы данных...</p>
            <p className={styles.loadingSubtext}>
              {user ? 'Загружаются книги для вашего аккаунта' : 'Загружаются общедоступные книги'}
            </p>
          </div>
        ) : books.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fas fa-database"></i>
            <h3>База данных пуста</h3>
            <p>
              {user 
                ? 'Для вашего аккаунта не найдено доступных книг'
                : 'Добавьте книги через админ-панель Supabase'
              }
            </p>
            <div className={styles.emptyActions}>
              <button onClick={loadBooks} className={styles.retryBtn}>
                Проверить снова
              </button>
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.supabaseLink}
              >
                Перейти в Supabase Dashboard
              </a>
            </div>
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
                  <span className={styles.pageDots}>...</span>
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
      </div>
    </SidebarLayout>
  );
}
