'use client';

import { useState, useEffect, ReactElement } from 'react';
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
      window.open(book.pdf_url, '_blank', 'noopener,noreferrer');
    } else {
      console.warn('PDF URL не найден для книги:', book.title);
    }
  };

  // Пагинация
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = Math.min(startIndex + booksPerPage, filteredBooks.length);
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  // Обновляем фильтры при изменении начальных книг
  useEffect(() => {
    setFilteredBooks(books);
    setCurrentPage(1);
  }, [books]);

  // Генерация кнопок пагинации
  const generatePaginationButtons = (): ReactElement[] => {
    const buttons: ReactElement[] = [];
    const maxVisibleButtons = 5;

    if (totalPages <= maxVisibleButtons) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            className={`${styles.pageBtn} ${currentPage === i ? styles.active : ''}`}
            onClick={() => setCurrentPage(i)}
            aria-label={`Страница ${i}`}
            aria-current={currentPage === i ? 'page' : undefined}
            type="button"
          >
            {i}
          </button>
        );
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
      const endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

      if (endPage - startPage + 1 < maxVisibleButtons) {
        startPage = Math.max(1, endPage - maxVisibleButtons + 1);
      }

      if (startPage > 1) {
        buttons.push(
          <button
            key={1}
            className={styles.pageBtn}
            onClick={() => setCurrentPage(1)}
            aria-label="Страница 1"
            type="button"
          >
            1
          </button>
        );
        
        if (startPage > 2) {
          buttons.push(
            <span 
              key="ellipsis-start" 
              className={styles.pageDots}
              aria-hidden="true"
            >
              ...
            </span>
          );
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        buttons.push(
          <button
            key={i}
            className={`${styles.pageBtn} ${currentPage === i ? styles.active : ''}`}
            onClick={() => setCurrentPage(i)}
            aria-label={`Страница ${i}`}
            aria-current={currentPage === i ? 'page' : undefined}
            type="button"
          >
            {i}
          </button>
        );
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          buttons.push(
            <span 
              key="ellipsis-end" 
              className={styles.pageDots}
              aria-hidden="true"
            >
              ...
            </span>
          );
        }
        
        buttons.push(
          <button
            key={totalPages}
            className={styles.pageBtn}
            onClick={() => setCurrentPage(totalPages)}
            aria-label={`Страница ${totalPages}`}
            type="button"
          >
            {totalPages}
          </button>
        );
      }
    }

    return buttons;
  };

  // Проверяем, какой пропс принимает BookGrid
  // Сначала создадим безопасную обертку
  const renderBookGrid = () => {
    // Проверяем, что BookGrid существует
    if (!BookGrid) {
      return <div>Компонент BookGrid не найден</div>;
    }

    // Создаем пропсы для BookGrid
    const bookGridProps = {
      books: currentBooks,
      // Проверяем возможные имена пропсов
      ...('onBookSelect' in BookGrid ? { onBookSelect: handleBookSelect } : {}),
      ...('onClick' in BookGrid ? { onClick: handleBookSelect } : {}),
      ...('onSelect' in BookGrid ? { onSelect: handleBookSelect } : {}),
    };

    // Если BookGrid не принимает обработчики событий, создаем обертку
    if (!('onBookSelect' in BookGrid) && !('onClick' in BookGrid) && !('onSelect' in BookGrid)) {
      return (
        <div 
          className={styles.bookGridWrapper}
          onClick={(e) => {
            // Делегирование событий можно реализовать здесь
            console.log('BookGrid wrapper clicked');
          }}
        >
          <BookGrid books={currentBooks} />
        </div>
      );
    }

    return <BookGrid {...bookGridProps} />;
  };

  // Сбрасываем на первую страницу при изменении отфильтрованных книг
  useEffect(() => {
    if (filteredBooks.length > 0) {
      const newTotalPages = Math.ceil(filteredBooks.length / booksPerPage);
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages || 1);
      }
    } else {
      setCurrentPage(1);
    }
  }, [filteredBooks, booksPerPage, currentPage]);

  return (
    <div className={styles.booksSection}>
      <div className={styles.booksHeader}>
        <div>
          <h1>Каталог технической литературы</h1>
          <p className={styles.booksCount}>
            Показано <span>{currentBooks.length}</span> из <span>{filteredBooks.length}</span> книг
            {filteredBooks.length !== books.length && (
              <span> (всего {books.length})</span>
            )}
          </p>
        </div>
      </div>

      {currentBooks.length > 0 ? (
        <>
          {renderBookGrid()}
          
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
              
              {generatePaginationButtons()}
              
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
      ) : (
        <div className={styles.noBooks}>
          <p>Книги не найдены</p>
          <button 
            onClick={() => setCurrentPage(1)}
            className={styles.resetButton}
            type="button"
          >
            Вернуться на первую страницу
          </button>
        </div>
      )}
    </div>
  );
}
