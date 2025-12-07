'use client';

import { Book } from '@/lib/types';
import BookCard from '../BookCard/BookCard';
import styles from './BookGrid.module.css';

interface BookGridProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
}

export default function BookGrid({ books, onBookSelect }: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className={styles.emptyState}>
        <i className="fas fa-book-open"></i>
        <h3>Книги не найдены</h3>
        <p>Попробуйте изменить параметры поиска или фильтры</p>
      </div>
    );
  }

  return (
    <div className={styles.booksGrid}>
      {books.map(book => (
        <BookCard
          key={book.id}
          book={book}
          onRead={onBookSelect}
        />
      ))}
    </div>
  );
}