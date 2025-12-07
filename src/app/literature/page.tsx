'use client';

import { useState, useEffect, useCallback } from 'react';
import SidebarLayout from '@/components/main-block/sidebar/SidebarLayout';
import FiltersSidebar from '@/components/books/FiltersSidebar/FiltersSidebar';
import BookGrid from '@/components/books/BookGrid/BookGrid';
import { Book, Filters } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import styles from './page.module.css';

export default function LiteraturePage() {
  console.log('🚀 LiteraturePage: Начало рендера');
  
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Реф для отслеживания загрузки
  const hasLoadedBooks = useRef(false);

  // Загрузка книг - ОДИН РАЗ
  useEffect(() => {
    console.log('📚 LiteraturePage: Загрузка книг началась');
    
    if (hasLoadedBooks.current) {
      console.log('📚 LiteraturePage: Книги уже загружены, пропускаю');
      return;
    }
    
    const loadBooks = async () => {
      try {
        console.log('🔍 LiteraturePage: Запрос к базе');
        const { data } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('✅ LiteraturePage: Ответ от базы:', data?.length || 0, 'книг');
        
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
          
          console.log('💾 LiteraturePage: Сохраняю книги в состояние');
          setBooks(booksData);
          setFilteredBooks(booksData); // ПОКАЗЫВАЕМ ВСЕ КНИГИ
          hasLoadedBooks.current = true;
        }
      } catch (error) {
        console.error('❌ LiteraturePage: Ошибка загрузки:', error);
      } finally {
        setLoading(false);
        console.log('🏁 LiteraturePage: Загрузка завершена');
      }
    };

    loadBooks();
    
    return () => {
      console.log('🧹 LiteraturePage: Очистка');
    };
  }, []);

  // Обработчик фильтров
  const handleFilterChange = useCallback((filters: Filters) => {
    console.log('🔧 LiteraturePage: Получены фильтры от sidebar:', {
      search: filters.search,
      categories: filters.categories.length,
      year: filters.year
    });
    
    if (books.length === 0) {
      console.log('⚠️ LiteraturePage: Книги еще не загружены, игнорирую фильтры');
      return;
    }
    
    // Проверяем, пустые ли фильтры
    const isEmpty = !filters.search && 
                    filters.categories.length === 0 && 
                    filters.tags.length === 0 &&
                    filters.authors.length === 0 &&
                    filters.year === 'all' &&
                    !filters.yearFrom &&
                    !filters.yearTo;
    
    console.log('🔧 LiteraturePage: Фильтры пустые?', isEmpty);
    
    if (isEmpty) {
      // ПОКАЗЫВАЕМ ВСЕ КНИГИ
      console.log('🔧 LiteraturePage: Показываю все книги');
      setFilteredBooks(books);
    } else {
      // Применяем фильтры
      console.log('🔧 LiteraturePage: Применяю фильтры к', books.length, 'книгам');
      
      let result = [...books];
      
      // Поиск
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(book => 
          (book.title?.toLowerCase().includes(searchLower)) ||
          (book.author?.toLowerCase().includes(searchLower))
        );
      }
      
      // Год
      if (filters.year !== 'all') {
        switch (filters.year) {
          case '2025':
            result = result.filter(book => book.year === 2025);
            break;
          case '2024':
            result = result.filter(book => book.year === 2024);
            break;
          case '2023-2021':
            result = result.filter(book => book.year >= 2021 && book.year <= 2023);
            break;
          case 'old':
            result = result.filter(book => book.year < 2021);
            break;
        }
      }
      
      console.log('🔧 LiteraturePage: После фильтрации осталось', result.length, 'книг');
      setFilteredBooks(result);
    }
  }, [books]);

  const handleBookSelect = (book: Book) => {
    if (book.pdf_url && book.pdf_url !== '#') {
      window.open(book.pdf_url, '_blank');
    }
  };

  console.log('📊 LiteraturePage: Статус', {
    loading,
    booksCount: books.length,
    filteredCount: filteredBooks.length
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
            <span style={{ 
              color: filteredBooks.length === 0 && books.length > 0 ? 'red' : 'inherit',
              fontWeight: filteredBooks.length === 0 && books.length > 0 ? 'bold' : 'normal'
            }}>
              {filteredBooks.length === 0 && books.length > 0 ? '❗ ' : ''}
              Показано: {filteredBooks.length}
            </span> из <span>{books.length}</span> книг
          </p>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>Загрузка книг...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fas fa-book-open"></i>
            <h3>{books.length === 0 ? 'Нет книг в базе' : 'Книги не найдены'}</h3>
            <p>
              {books.length === 0 
                ? 'Добавьте книги через админ-панель' 
                : 'Попробуйте изменить фильтры или нажмите "Сбросить"'}
            </p>
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
