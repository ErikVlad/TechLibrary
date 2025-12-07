'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import SidebarLayout from '@/components/main-block/sidebar/SidebarLayout';
import FiltersSidebar from '@/components/books/FiltersSidebar/FiltersSidebar';
import BookGrid from '@/components/books/BookGrid/BookGrid';
import { Book, Filters } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider'; // Восстанавливаем
import styles from './page.module.css';

export default function LiteraturePage() {
  console.log('🚀 LiteraturePage: Начало рендера');
  const { user } = useAuth(); // Используем
  
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Рефы для контроля
  const hasLoadedBooks = useRef(false);
  const lastUserId = useRef<string | null>(null);

  // Загрузка книг - зависит от пользователя
  useEffect(() => {
    const loadBooks = async () => {
      // Если книги уже загружены для этого пользователя - пропускаем
      if (hasLoadedBooks.current && user?.id === lastUserId.current) {
        console.log('📚 Книги уже загружены для этого пользователя');
        setLoading(false);
        return;
      }
      
      console.log('📚 Загрузка книг для пользователя:', user?.email || 'не авторизован');
      
      try {
        const { data } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
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
          
          console.log('✅ Загружено книг:', booksData.length);
          setBooks(booksData);
          setFilteredBooks(booksData);
          hasLoadedBooks.current = true;
          lastUserId.current = user?.id || null;
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, [user?.id]); // Загружаем при изменении ID пользователя

  // Функция фильтрации
  const filterBooks = useCallback((booksList: Book[], filters: Filters): Book[] => {
    if (!booksList || booksList.length === 0) return [];
    
    let filtered = [...booksList];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(book => 
        (book.title?.toLowerCase().includes(searchLower)) ||
        (book.author?.toLowerCase().includes(searchLower))
      );
    }

    if (filters.categories?.length > 0) {
      filtered = filtered.filter(book => 
        book.category && filters.categories.includes(book.category)
      );
    }

    if (filters.year && filters.year !== 'all') {
      switch (filters.year) {
        case '2025':
          filtered = filtered.filter(book => book.year === 2025);
          break;
        case '2024':
          filtered = filtered.filter(book => book.year === 2024);
          break;
        case '2023-2021':
          filtered = filtered.filter(book => book.year >= 2021 && book.year <= 2023);
          break;
        case 'old':
          filtered = filtered.filter(book => book.year < 2021);
          break;
      }
    }

    return filtered;
  }, []);

  // Обработчик фильтров
  const handleFilterChange = useCallback((filters: Filters) => {
    console.log('🔧 Получены фильтры:', filters);
    
    const filtered = filterBooks(books, filters);
    setFilteredBooks(filtered);
  }, [books, filterBooks]);

  const handleBookSelect = (book: Book) => {
    if (book.pdf_url && book.pdf_url !== '#') {
      window.open(book.pdf_url, '_blank');
    }
  };

  console.log('📊 LiteraturePage: Статус', {
    loading,
    booksCount: books.length,
    filteredCount: filteredBooks.length,
    user: user?.email || 'нет'
  });

  return (
    <SidebarLayout
      filters={
        <FiltersSidebar
          books={books}
          onFilterChange={handleFilterChange}
        />
      }
    >
      <div className={styles.booksSection}>
        <div className={styles.booksHeader}>
          <h1>Каталог технической литературы</h1>
          <p className={styles.booksCount}>
            Показано: <span>{filteredBooks.length}</span> из <span>{books.length}</span> книг
            {user && <span style={{ marginLeft: '10px', color: '#666' }}>({user.email})</span>}
          </p>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>Загрузка книг...</p>
          </div>
        ) : (
          <BookGrid 
            books={filteredBooks} 
            onBookSelect={handleBookSelect}
          />
        )}
      </div>
    </SidebarLayout>
  );
}
