'use client';

import { Book } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
// Временно закомментируем все импорты кроме необходимых
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/components/providers/AuthProvider';
import styles from './BookCard.module.css';

interface BookCardProps {
  book: Book;
  onRead: (book: Book) => void;
}

export default function BookCard({ book, onRead }: BookCardProps) {
  // Временно отключаем
  // const { user } = useAuth();
  const user = null;
  
  const [isFavorite] = useState(false);
  const [isLoading] = useState(false);

  const handleReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRead(book);
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Book info:', book);
  };

  return (
    <div className={styles.bookCard}>
      <div className={styles.bookImage}>
        <i className="fas fa-code"></i>
        {book.year && book.year >= 2024 && (
          <span className={styles.bookBadge}>Новинка</span>
        )}
      </div>
      <div className={styles.bookContent}>
        <h3 className={styles.bookTitle}>{book.title}</h3>
        <p className={styles.bookAuthor}>{book.author}</p>
        <p className={styles.bookYear}>
          {book.year} • {book.pages} страниц
        </p>
        
        <div className={styles.bookTags}>
          {book.tags && book.tags.slice(0, 3).map(tag => (
            <span key={tag} className={styles.bookTag}>{tag}</span>
          ))}
        </div>
        
        <p className={styles.bookDescription}>
          {book.description && book.description.length > 120 
            ? `${book.description.substring(0, 120)}...` 
            : book.description}
        </p>
        
        <div className={styles.bookActions}>
          <button 
            onClick={handleReadClick}
            className={styles.btnPrimary}
            title="Читать книгу"
          >
            <i className="fas fa-book-open"></i> Читать
          </button>
          
          <button 
            className={styles.btnOutline} 
            onClick={handleInfoClick}
            title="Подробная информация"
          >
            <i className="fas fa-info-circle"></i>
          </button>
          
          <button 
            className={styles.btnOutline}
            onClick={(e) => {
              e.stopPropagation();
              alert('Функционал избранного временно отключен');
            }}
            title="Избранное отключено"
          >
            <i className="far fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
