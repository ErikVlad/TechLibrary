'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client'; // Изменено с '@/lib/supabase'
import { Book } from '@/lib/types';
import styles from './BookDetail.module.css';

export default function BookDetailPage() {
  const params = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBook() {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('id', params.id)
          .single();
        
        if (error) throw error;
        setBook(data);
      } catch (error) {
        console.error('Error fetching book:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchBook();
  }, [params.id]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>Загрузка книги...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className={styles.notFoundContainer}>
        <h1 className={styles.notFoundTitle}>Книга не найдена</h1>
        <Link href="/literature" className={styles.backLink}>
          Вернуться в библиотеку
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.bookDetailPage}>
      {/* Хлебные крошки */}
      <nav className={styles.breadcrumbs}>
        <Link href="/" className={styles.breadcrumbLink}>Главная</Link> → 
        <Link href="/literature" className={styles.breadcrumbLink}>Библиотека</Link> → 
        <span className={styles.breadcrumbCurrent}> {book.title}</span>
      </nav>

      {/* Карточка книги */}
      <div className={styles.bookCard}>
        <div className={styles.bookHeader}>
          <h1 className={styles.bookTitle}>{book.title}</h1>
          <p className={styles.bookAuthor}>Автор: {book.author}</p>
          
          {book.description && (
            <p className={styles.bookDescription}>
              {book.description}
            </p>
          )}
        </div>

        {/* Мета-информация */}
        <div className={styles.metaContainer}>
          {book.category && (
            <div className={styles.metaItem}>
              <div className={styles.metaLabel}>Категория</div>
              <div className={styles.metaValue}>{book.category}</div>
            </div>
          )}
          
          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>Страниц</div>
            <div className={styles.metaValue}>{book.pages}</div>
          </div>
          
          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>Год</div>
            <div className={styles.metaValue}>{book.year}</div>
          </div>
        </div>

        {/* Кнопки */}
        <div className={styles.buttonsContainer}>
          {book.pdf_url ? (
            <>
              <a
                href={book.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.button} ${styles.readButton}`}
              >
                📖 Читать онлайн
              </a>
              
              <a
                href={book.pdf_url}
                download
                className={`${styles.button} ${styles.downloadButton}`}
              >
                ⬇️ Скачать PDF
              </a>
            </>
          ) : (
            <button
              disabled
              className={`${styles.button} ${styles.disabledButton}`}
            >
              PDF недоступен
            </button>
          )}
          
          <button className={`${styles.button} ${styles.favoriteButton}`}>
            ❤️ В избранное
          </button>
        </div>
      </div>

      {/* PDF просмотр */}
      {book.pdf_url && (
        <div className={styles.pdfContainer}>
          <h3 className={styles.pdfTitle}>📄 Чтение PDF</h3>
          
          <div className={styles.pdfViewer}>
            <iframe 
              src={book.pdf_url} 
              className={styles.pdfIframe}
              title="PDF просмотр"
            />
          </div>
          
          <div className={styles.pdfLinkContainer}>
            <a 
              href={book.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.pdfLink}
            >
              Открыть PDF в новой вкладке →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
