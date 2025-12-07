'use client';

import { useState, useEffect } from 'react';
import { Book } from '@/lib/types';
import BookGrid from './BookGrid/BookGrid';
import styles from './ClientBooksSection.module.css';

interface ClientBooksSectionProps {
  initialBooks: Book[];
}

export default function ClientBooksSection({ initialBooks }: ClientBooksSectionProps) {
  const [books] = useState<Book[]>(initialBooks);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(initialBooks);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;

  const handleBookSelect = (book: Book) => {
    if (book.pdf_url) {
      window.open(book.pdf_url, '_blank');
    } else {
      console.error('PDF URL не найден');
    }
  };

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  useEffect(() => {
    setFilteredBooks(books);
  }, [books]);

  return (
    <div className={styles.booksSection}>
      <div className={styles.booksHeader}>
        <div>
          <h1>Каталог технической литературы</h1>
          <p className={styles.booksCount}>
            Показано <span>{filteredBooks.length}</span> из <span>{books.length}</span> книг
          </p>
        </div>
      </div>

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
          
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className={styles.ellipsis}>...</span>
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
    </div>
  );
}
