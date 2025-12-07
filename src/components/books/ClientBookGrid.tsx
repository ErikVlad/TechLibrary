'use client';

import { useState } from 'react';
import { Book } from '@/lib/types';
import BookCard from './BookCard/BookCard';
import styles from './BookGrid.module.css';

interface ClientBookGridProps {
  initialBooks: Book[];
}

export default function ClientBookGrid({ initialBooks }: ClientBookGridProps) {
  const [books] = useState(initialBooks);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;

  const handleBookSelect = (book: Book) => {
    if (book.pdf_url) {
      window.open(book.pdf_url, '_blank');
    } else {
      console.error('PDF URL не найден');
    }
  };

  const totalPages = Math.ceil(books.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const currentBooks = books.slice(startIndex, endIndex);

  if (!books || books.length === 0) {
    return (
      <div className={styles.emptyState}>
        <i className="fas fa-book-open"></i>
        <h3>Книги не найдены</h3>
        <p>Попробуйте изменить параметры поиска или фильтры</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.booksGrid}>
        {currentBooks.map(book => (
          <BookCard
            key={book.id}
            book={book}
            onRead={handleBookSelect}
          />
        ))}
      </div>
      
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
              >
                {pageNum}
              </button>
            );
          })}
          
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
  );
}
