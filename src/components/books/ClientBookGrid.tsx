'use client';

import { useState, useMemo } from 'react';
import { Book } from '@/lib/types';
import BookCard from './BookCard/BookCard';
import styles from './BookGrid/BookGrid.module.css';

interface ClientBookGridProps {
  initialBooks: Book[];
}

export default function ClientBookGrid({ initialBooks }: ClientBookGridProps) {
  const [books] = useState(initialBooks);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;

  const handleBookSelect = (book: Book) => {
    if (book.pdf_url) {
      window.open(book.pdf_url, '_blank', 'noopener,noreferrer');
    } else {
      console.warn('PDF URL не найден для книги:', book.title);
    }
  };

  const { totalPages, currentBooks, paginationButtons } = useMemo(() => {
    const totalPages = Math.ceil(books.length / booksPerPage);
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const currentBooks = books.slice(startIndex, endIndex);
    
    const paginationButtons: number[] = [];
    const maxVisibleButtons = 5;
    
    if (totalPages <= maxVisibleButtons) {
      for (let i = 1; i <= totalPages; i++) {
        paginationButtons.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
      const endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
      
      if (endPage - startPage + 1 < maxVisibleButtons) {
        startPage = Math.max(1, endPage - maxVisibleButtons + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        paginationButtons.push(i);
      }
    }
    
    return { totalPages, currentBooks, paginationButtons };
  }, [books, currentPage]);

  // Временное решение: обернуть BookCard в кликабельный div
  const renderBookCard = (book: Book) => {
    return (
      <div 
        key={book.id}
        className={styles.bookCardWrapper}
        onClick={() => handleBookSelect(book)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBookSelect(book);
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        <BookCard book={book} />
      </div>
    );
  };

  return (
    <>
      {currentBooks.length > 0 ? (
        <div className={styles.booksGrid}>
          {currentBooks.map(book => renderBookCard(book))}
        </div>
      ) : (
        <div className={styles.noBooks}>
          <p>Книги не найдены</p>
        </div>
      )}
      
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            className={styles.pageBtn}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            aria-label="Предыдущая страница"
            type="button"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          {paginationButtons.map(pageNum => (
            <button
              key={pageNum}
              className={`${styles.pageBtn} ${currentPage === pageNum ? styles.active : ''}`}
              onClick={() => setCurrentPage(pageNum)}
              aria-label={`Страница ${pageNum}`}
              aria-current={currentPage === pageNum ? 'page' : undefined}
              type="button"
            >
              {pageNum}
            </button>
          ))}
          
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <span className={styles.pageDots}>...</span>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(totalPages)}
                aria-label={`Страница ${totalPages}`}
                type="button"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button 
            className={styles.pageBtn}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            aria-label="Следующая страница"
            type="button"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </>
  );
}
