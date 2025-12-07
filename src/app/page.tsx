// app/page.tsx - исправленная версия
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Book } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import styles from './page.module.css';

export default function HomePage() {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  // Загружаем только несколько книг для главной
  useEffect(() => {
    if (hasLoadedRef.current) return;
    
    const loadFeaturedBooks = async () => {
      try {
        setLoading(true);
        console.log('HomePage: Загрузка избранных книг');
        
        // Только 4 книги для главной
        const { data } = await supabase
          .from('books')
          .select('*')
          .limit(4)
          .order('created_at', { ascending: false });

        if (data) {
          const booksData: Book[] = data.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            description: book.description || '',
            year: book.year,
            pages: book.pages,
            pdf_url: book.pdf_url || '#',
            category: book.category || 'Не указана',
            tags: book.tags || [],
            created_at: book.created_at,
            updated_at: book.updated_at
          }));
          
          console.log('HomePage: Загружено избранных книг:', booksData.length);
          setFeaturedBooks(booksData);
          hasLoadedRef.current = true;
        }
      } catch (error) {
        console.error('HomePage: Ошибка загрузки книг:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedBooks();
  }, []); // Только при монтировании

  return (
    <div className={styles.homePage}>
      <div className={styles.hero}>
        <h1>TechLibrary</h1>
        <p>Бесплатная библиотека технической литературы для разработчиков</p>
        <Link href="/literature" className={styles.ctaButton}>
          <i className="fas fa-book-open"></i> Смотреть все книги
        </Link>
      </div>
      
      {loading ? (
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin"></i> Загрузка книг...
        </div>
      ) : featuredBooks.length > 0 && (
        <div className={styles.featuredBooks}>
          <h2>Новые поступления</h2>
          <div className={styles.booksGrid}>
            {featuredBooks.map(book => (
              <div key={book.id} className={styles.bookCard}>
                <h3>{book.title}</h3>
                <p className={styles.bookAuthor}>{book.author}</p>
                <p className={styles.bookYear}>{book.year} • {book.pages} стр.</p>
                <Link href={`/literature`} className={styles.readButton}>
                  <i className="fas fa-external-link-alt"></i> Перейти в библиотеку
                </Link>
              </div>
            ))}
          </div>
          <div className={styles.seeAll}>
            <Link href="/literature" className={styles.seeAllButton}>
              <i className="fas fa-arrow-right"></i> Смотреть все книги ({featuredBooks.length}+)
            </Link>
          </div>
        </div>
      )}
      
      <div className={styles.features}>
        <div className={styles.feature}>
          <i className="fas fa-book"></i>
          <h3>Бесплатные книги</h3>
          <p>Доступ к сотням технических книг без ограничений</p>
        </div>
        <div className={styles.feature}>
          <i className="fas fa-search"></i>
          <h3>Умный поиск</h3>
          <p>Мощные фильтры по категориям, авторам и тегам</p>
        </div>
        <div className={styles.feature}>
          <i className="fas fa-heart"></i>
          <h3>Избранное</h3>
          <p>Сохраняйте понравившиеся книги в личную коллекцию</p>
        </div>
      </div>
    </div>
  );
}
