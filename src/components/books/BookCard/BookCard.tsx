'use client';

import { Book } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import styles from './BookCard.module.css';
import Link from 'next/link';

interface BookCardProps {
  book: Book;
  // onRead: (book: Book) => void; ← УДАЛИТЬ ЭТУ СТРОЧКУ
}

export default function BookCard({ book }: BookCardProps) { // ← Убрали onRead
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);

  // Проверяем, добавлена ли книга в избранное при загрузке
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

  // Добавление/удаление из избранного
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      alert('Войдите в аккаунт, чтобы добавлять книги в избранное');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isFavorite && favoriteId) {
        // Удаляем из избранного
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', favoriteId);
        
        if (error) throw error;
        
        setIsFavorite(false);
        setFavoriteId(null);
        console.log('Книга удалена из избранного');
      } else {
        // Добавляем в избранное
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
          // Если книга уже в избранном
          if (error.code === '23505') {
            await checkIfFavorite(); // Обновляем статус
          } else {
            throw error;
          }
        } else if (data) {
          setIsFavorite(true);
          setFavoriteId(data.id);
          console.log('Книга добавлена в избранное');
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
    // Здесь будет логика для модального окна с деталями
    console.log('Book info:', book);
  };

  // Если у книги нет ID, не показываем кнопку избранного
  const canAddToFavorites = user && book.id;

  return (
    <div className={styles.bookCard}>
      <div className={styles.bookImage}>
        <i className="fas fa-code"></i>
        {book.year >= 2024 && (
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
          {book.tags.slice(0, 3).map(tag => (
            <span key={tag} className={styles.bookTag}>{tag}</span>
          ))}
        </div>
        
        <p className={styles.bookDescription}>
          {book.description.length > 120 
            ? `${book.description.substring(0, 120)}...` 
            : book.description}
        </p>
        
        <div className={styles.bookActions}>
          {/* ИСПРАВЛЕНО: Link вместо button с onClick */}
          <Link 
            href={`/literature/${book.id}`}
            className={styles.btnPrimary}
            title="Читать книгу"
          >
            <i className="fas fa-book-open"></i> Читать
          </Link>
          
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