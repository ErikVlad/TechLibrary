'use client';

import { useState } from 'react';
import { Book } from '@/lib/types';
import BookCard from './BookCard/BookCard';
import styles from './BookGrid.module.css';

interface ClientBookGridProps {
  books: Book[]; // Изменено: принимает уже отфильтрованные книги
  onBookSelect: (book: Book) => void; // Добавлено: пропс для выбора книги
}

export default function ClientBookGrid({ books, onBookSelect }: ClientBookGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;

  if (!books || books.length === 0) {
    return (
      <div className={styles.emptyState}>
        <i className="fas fa-book-open"></i>
        <h3>Книги не найдены</h3>
        <p>Попробуйте изменить параметры поиска или фильтры</p>
      </div>
    );
  }

  const totalPages = Math.ceil(books.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const currentBooks = books.slice(startIndex, endIndex);

  // Сбрасываем на первую страницу при изменении фильтров
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  return (
    <>
      <div className={styles.booksGrid}>
        {currentBooks.map(book => (
          <BookCard
            key={book.id}
            book={book}
            onRead={onBookSelect}
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
