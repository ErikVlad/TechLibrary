'use client';

import { useState, useEffect } from 'react';
import { Book } from '@/lib/types';
import BookGrid from './BookGrid/BookGrid';
import styles from './ClientBooksSection.module.css';

interface ClientBooksSectionProps {
  books: Book[];
  title?: string;
  description?: string;
  showPagination?: boolean;
  booksPerPage?: number;
  showBooksCount?: boolean;
  onBookSelect: (book: Book) => void;
}

export default function ClientBooksSection({ 
  books, 
  title = "Каталог технической литературы", 
  description,
  showPagination = false, // По умолчанию без пагинации
  booksPerPage = 12,
  showBooksCount = true,
  onBookSelect 
}: ClientBooksSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Сбрасываем страницу при изменении списка книг
  useEffect(() => {
    setCurrentPage(1);
  }, [books]);
  
  // Определяем, какие книги показывать
  const displayBooks = showPagination 
    ? books.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage)
    : books;
  
  const totalPages = Math.ceil(books.length / booksPerPage);
  
  // Если текущая страница больше общего количества страниц, сбрасываем на первую
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  if (!books || books.length === 0) {
    return (
      <div className={styles.booksSection}>
        <div className={styles.booksHeader}>
          <div>
            <h1>{title}</h1>
            {description && <p className={styles.booksDescription}>{description}</p>}
          </div>
        </div>
        
        <div className={styles.emptyState}>
          <i className="fas fa-book-open"></i>
          <h3>Книги не найдены</h3>
          <p>Нет доступных книг для отображения</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.booksSection}>
      <div className={styles.booksHeader}>
        <div>
          <h1>{title}</h1>
          {description && <p className={styles.booksDescription}>{description}</p>}
          {showBooksCount && (
            <p className={styles.booksCount}>
              {showPagination 
                ? `Показано ${displayBooks.length} из ${books.length} книг (Страница ${currentPage} из ${totalPages})`
                : `Всего книг: ${books.length}`
              }
            </p>
          )}
        </div>
      </div>

      <BookGrid 
        books={displayBooks} 
        onBookSelect={onBookSelect}
      />
      
      {showPagination && totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            className={styles.pageBtn}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            aria-label="Предыдущая страница"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          {/* Показываем кнопки страниц */}
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
                className={`${styles.pageBtn} ${currentPage === pageNum ? styles.active : ''}`}
                onClick={() => setCurrentPage(pageNum)}
                aria-label={`Страница ${pageNum}`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
          
          {/* Многоточие для большого количества страниц */}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className={styles.pageDots}>...</span>
          )}
          
          {/* Последняя страница для большого количества страниц */}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage(totalPages)}
              aria-label={`Страница ${totalPages}`}
            >
              {totalPages}
            </button>
          )}
          
          <button 
            className={styles.pageBtn}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            aria-label="Следующая страница"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}
