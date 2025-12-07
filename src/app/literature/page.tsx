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
  const booksPerPage = 12;
  
  // Рефы для контроля инициализации
  const hasLoadedBooksRef = useRef(false);
  const hasAppliedFiltersRef = useRef(false);
  const initialFiltersRef = useRef<Filters | null>(null);

  // Функция для получения фильтров из URL (один раз при загрузке)
  const getInitialFilters = useCallback((): Filters => {
    if (typeof window === 'undefined') {
      return {
        search: '',
        categories: [],
        year: 'all',
        tags: [],
        authors: [],
        yearFrom: '',
        yearTo: ''
      };
    }
    
    const searchParams = new URLSearchParams(window.location.search);
    return {
      search: searchParams.get('search') || '',
      categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
      year: searchParams.get('year') || 'all',
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
      authors: searchParams.get('authors')?.split(',').filter(Boolean) || [],
      yearFrom: searchParams.get('yearFrom') || '',
      yearTo: searchParams.get('yearTo') || '',
    };
  }, []);

  // Функция фильтрации книг
  const filterBooks = useCallback((booksList: Book[], filters: Filters): Book[] => {
    if (!booksList || booksList.length === 0) return [];
    
    console.log('Применяем фильтры:', filters);
    console.log('Книг до фильтрации:', booksList.length);
    
    let filtered = [...booksList];

    // Поиск
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(book => 
        (book.title && book.title.toLowerCase().includes(searchLower)) ||
        (book.author && book.author.toLowerCase().includes(searchLower)) ||
        (book.description && book.description.toLowerCase().includes(searchLower))
      );
      console.log('После поиска:', filtered.length);
    }

    // Категории
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(book => 
        book.category && filters.categories.includes(book.category)
      );
      console.log('После категорий:', filtered.length);
    }

    // Авторы
    if (filters.authors && filters.authors.length > 0) {
      filtered = filtered.filter(book => 
        book.author && filters.authors.includes(book.author)
      );
      console.log('После авторов:', filtered.length);
    }

    // Теги
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(book => 
        book.tags && book.tags.some(tag => filters.tags.includes(tag))
      );
      console.log('После тегов:', filtered.length);
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
      console.log('После года:', filtered.length);
    }

    // Диапазон лет
    if (filters.yearFrom) {
      const yearFromNum = parseInt(filters.yearFrom);
      if (!isNaN(yearFromNum)) {
        filtered = filtered.filter(book => book.year && book.year >= yearFromNum);
      }
      console.log('После yearFrom:', filtered.length);
    }
    
    if (filters.yearTo) {
      const yearToNum = parseInt(filters.yearTo);
      if (!isNaN(yearToNum)) {
        filtered = filtered.filter(book => book.year && book.year <= yearToNum);
      }
      console.log('После yearTo:', filtered.length);
    }

    console.log('Книг после фильтрации:', filtered.length);
    return filtered;
  }, []);

  // Загрузка книг
  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Загрузка книг из Supabase...');
      
      const { data, error: supabaseError } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        console.error('Ошибка Supabase:', supabaseError);
        throw new Error(`Ошибка Supabase: ${supabaseError.message}`);
      }

      console.log('Данные получены:', data?.length || 0, 'книг');
      
      if (!data || data.length === 0) {
        console.log('В базе данных нет книг');
        setBooks([]);
        setFilteredBooks([]);
        setError('В базе данных пока нет книг.');
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
        
        console.log('Преобразовано книг:', booksData.length);
        setBooks(booksData);
        
        // Сохраняем книги как загруженные
        hasLoadedBooksRef.current = true;
        
        // Если еще не применяли фильтры, применяем начальные
        if (!hasAppliedFiltersRef.current) {
          const initialFilters = getInitialFilters();
          console.log('Применяем начальные фильтры из URL:', initialFilters);
          
          const filtered = filterBooks(booksData, initialFilters);
          console.log('Результат фильтрации:', filtered.length, 'книг');
          
          setFilteredBooks(filtered);
          hasAppliedFiltersRef.current = true;
        }
      }
    } catch (error) {
      console.error('Error loading books:', error);
      const err = error as Error;
      setError(`Не удалось загрузить книги: ${err.message}`);
      setBooks([]);
      setFilteredBooks([]);
    } finally {
      setLoading(false);
    }
  }, [getInitialFilters, filterBooks]);

  // Загружаем книги при монтировании
  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Обработчик изменения фильтров от FiltersSidebar
  const handleFilterChange = useCallback((filters: Filters) => {
    console.log('Получены новые фильтры от FiltersSidebar:', filters);
    
    if (!hasLoadedBooksRef.current) {
      console.log('Книги еще не загружены, откладываем фильтрацию');
      return;
    }
    
    const filtered = filterBooks(books, filters);
    console.log('Фильтрация книг:', books.length, '->', filtered.length);
    
    setFilteredBooks(filtered);
    setCurrentPage(1); // Сбрасываем на первую страницу
    hasAppliedFiltersRef.current = true;
  }, [books, filterBooks]);

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

  // Сброс страницы если она выходит за пределы
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredBooks, currentPage, totalPages]);

  console.log('Текущее состояние:', {
    loading,
    booksCount: books.length,
    filteredCount: filteredBooks.length,
    currentPage,
    totalPages
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
          <div>
            <h1>Каталог технической литературы</h1>
            <p className={styles.booksCount}>
              Показано <span>{filteredBooks.length}</span> из <span>{books.length}</span> книг
            </p>
          </div>
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

        {error && (
          <div className={styles.errorContainer}>
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <div className={styles.errorActions}>
              <button onClick={loadBooks} className={styles.retryBtn}>
                Попробовать снова
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>Загрузка книг из базы данных...</p>
          </div>
        ) : books.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fas fa-database"></i>
            <h3>База данных пуста</h3>
            <p>Добавьте книги через админ-панель Supabase</p>
            <div className={styles.emptyActions}>
              <button onClick={loadBooks} className={styles.retryBtn}>
                Проверить снова
              </button>
            </div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fas fa-filter"></i>
            <h3>Книги не найдены</h3>
            <p>Попробуйте изменить параметры поиска или сбросить фильтры</p>
            <div className={styles.emptyActions}>
              <button 
                onClick={() => handleFilterChange({
                  search: '',
                  categories: [],
                  year: 'all',
                  tags: [],
                  authors: [],
                  yearFrom: '',
                  yearTo: ''
                })}
                className={styles.retryBtn}
              >
                Сбросить фильтры
              </button>
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
