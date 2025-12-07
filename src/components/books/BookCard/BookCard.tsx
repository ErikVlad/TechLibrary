'use client';

import { Book } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import styles from './BookCard.module.css';

interface BookCardProps {
  book: Book;
  onRead: (book: Book) => void;
}

export default function BookCard({ book, onRead }: BookCardProps) {
  //const { user } = useAuth();
  const user = null;
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);

  const checkIfFavorite = useCallback(async () => {
    if (!user || !book.id) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('book_id', book.id)
        .maybeSingle();
      
      if (error) {
        console.error('Ошибка проверки избранного:', error);
        return;
      }
      
      if (data) {
        setIsFavorite(true);
        setFavoriteId(data.id);
      } else {
        setIsFavorite(false);
        setFavoriteId(null);
      }
    } catch (error) {
      console.error('Ошибка проверки избранного:', error);
    }
  }, [user, book.id]);

  useEffect(() => {
    if (user && book.id) {
      checkIfFavorite();
    }
  }, [user, book.id, checkIfFavorite]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      alert('Войдите в аккаунт, чтобы добавлять книги в избранное');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isFavorite && favoriteId) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', favoriteId);
        
        if (error) throw error;
        
        setIsFavorite(false);
        setFavoriteId(null);
      } else {
        const { data, error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            book_id: book.id,
            book_title: book.title,
            book_author: book.author,
            book_category: book.category || 'Не указано',
            book_year: book.year,
            book_pages: book.pages,
            book_description: book.description,
            book_tags: book.tags
          })
          .select()
          .single();
        
        if (error) {
          if (error.code === '23505') {
            await checkIfFavorite();
          } else {
            throw error;
          }
        } else if (data) {
          setIsFavorite(true);
          setFavoriteId(data.id);
        }
      }
    } catch (error) {
      console.error('Ошибка избранного:', error);
      const err = error as Error;
      alert(err.message || 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Book info:', book);
  };

  const handleReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRead(book);
  };

  const canAddToFavorites = user && book.id;

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
          
          {canAddToFavorites ? (
            <button 
              className={`${styles.btnOutline} ${isFavorite ? styles.favoriteActive : ''}`} 
              onClick={handleFavoriteClick}
              disabled={isLoading}
              title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : isFavorite ? (
                <i className="fas fa-heart"></i>
              ) : (
                <i className="far fa-heart"></i>
              )}
            </button>
          ) : (
            <button 
              className={styles.btnOutline}
              onClick={(e) => {
                e.stopPropagation();
                alert('Войдите в аккаунт, чтобы добавлять книги в избранное');
              }}
              title="Войдите, чтобы добавить в избранное"
            >
              <i className="far fa-heart"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
