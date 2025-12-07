'use client';

import { useState, useEffect, useCallback } from 'react';
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

  // Загрузка книг
  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      if (!data || data.length === 0) {
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
        
        console.log('Загружено книг:', booksData.length);
        setBooks(booksData);
        setFilteredBooks(booksData); // Сразу показываем ВСЕ книги
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
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Функция фильтрации
  const filterBooks = useCallback((booksList: Book[], filters: Filters): Book[] => {
    if (!booksList || booksList.length === 0) return [];
    
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

    // Авторы
    if (filters.authors?.length > 0) {
      filtered = filtered.filter(book => 
        book.author && filters.authors.includes(book.author)
      );
    }

    // Теги
    if (filters.tags?.length > 0) {
      filtered = filtered.filter(book => 
        book.tags?.some(tag => filters.tags.includes(tag))
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
        filtered = filtered.filter(book => book.year && book.year >= yearFromNum);
      }
    }
    
    if (filters.yearTo) {
      const yearToNum = parseInt(filters.yearTo);
      if (!isNaN(yearToNum)) {
        filtered = filtered.filter(book => book.year && book.year <= yearToNum);
      }
    }

    return filtered;
  }, []);

  // Обработчик изменения фильтров
  const handleFilterChange = useCallback((filters: Filters) => {
    console.log('Получены фильтры:', filters);
    const filtered = filterBooks(books, filters);
    console.log('Отфильтровано книг:', filtered.length);
    setFilteredBooks(filtered);
    setCurrentPage(1);
  }, [books, filterBooks]);

  const handleBookSelect = (book: Book) => {
    if (book.pdf_url && book.pdf_url !== '#') {
      window.open(book.pdf_url, '_blank');
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
          >
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
            {loading ? ' Загрузка...' : ' Обновить'}
          </button>
        </div>

        {error && (
          <div className={styles.errorContainer}>
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <button onClick={loadBooks} className={styles.retryBtn}>
              Попробовать снова
            </button>
          </div>
        )}

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>Загрузка книг...</p>
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
                      className={currentPage === pageNum ? styles.active : ''}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
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
