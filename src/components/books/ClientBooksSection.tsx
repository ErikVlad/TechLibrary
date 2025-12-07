'use client';

import { useState, useEffect } from 'react';
import { Book, Filters } from '@/lib/types';
import FiltersSidebar from './FiltersSidebar';
import BookGrid from './BookGrid';

export default function BooksPage({ initialBooks }: { initialBooks: Book[] }) {
  const [allBooks, setAllBooks] = useState<Book[]>(initialBooks);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(initialBooks);
  const [isInitialized, setIsInitialized] = useState(false);

  // Функция фильтрации книг
  const filterBooks = (books: Book[], filters: Filters): Book[] => {
    let result = [...books];

    // Поиск по тексту
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(book => 
        (book.title && book.title.toLowerCase().includes(searchLower)) ||
        (book.author && book.author.toLowerCase().includes(searchLower)) ||
        (book.description && book.description.toLowerCase().includes(searchLower))
      );
    }

    // Фильтр по категориям
    if (filters.categories.length > 0) {
      result = result.filter(book => 
        book.category && filters.categories.includes(book.category)
      );
    }

    // Фильтр по тегам
    if (filters.tags.length > 0) {
      result = result.filter(book => 
        book.tags && book.tags.some(tag => filters.tags.includes(tag))
      );
    }

    // Фильтр по авторам
    if (filters.authors.length > 0) {
      result = result.filter(book => 
        book.author && filters.authors.includes(book.author)
      );
    }

    // Фильтр по году
    if (filters.year !== 'all') {
      result = result.filter(book => {
        const year = book.year;
        if (!year) return false;
        
        switch (filters.year) {
          case '2025':
            return year === 2025;
          case '2024':
            return year === 2024;
          case '2023-2021':
            return year >= 2021 && year <= 2023;
          case 'old':
            return year < 2021;
          default:
            return true;
        }
      });
    }

    // Диапазон годов
    if (filters.yearFrom) {
      const yearFromNum = parseInt(filters.yearFrom);
      if (!isNaN(yearFromNum)) {
        result = result.filter(book => book.year >= yearFromNum);
      }
    }

    if (filters.yearTo) {
      const yearToNum = parseInt(filters.yearTo);
      if (!isNaN(yearToNum)) {
        result = result.filter(book => book.year <= yearToNum);
      }
    }

    return result;
  };

  // Обработчик изменения фильтров
  const handleFilterChange = (filters: Filters) => {
    if (allBooks.length === 0) return;
    
    const filtered = filterBooks(allBooks, filters);
    setFilteredBooks(filtered);
  };

  // При загрузке компонента сразу применяем фильтры из URL
  useEffect(() => {
    if (!isInitialized && allBooks.length > 0) {
      setIsInitialized(true);
      // Создаем начальные фильтры из URL
      const searchParams = new URLSearchParams(window.location.search);
      const initialFilters: Filters = {
        search: searchParams.get('search') || '',
        categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
        year: searchParams.get('year') || 'all',
        tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
        authors: searchParams.get('authors')?.split(',').filter(Boolean) || [],
        yearFrom: searchParams.get('yearFrom') || '',
        yearTo: searchParams.get('yearTo') || '',
      };
      
      const filtered = filterBooks(allBooks, initialFilters);
      setFilteredBooks(filtered);
    }
  }, [allBooks, isInitialized]);

  // Обновляем фильтры при изменении начальных книг
  useEffect(() => {
    if (initialBooks.length > 0) {
      setAllBooks(initialBooks);
      setFilteredBooks(initialBooks);
    }
  }, [initialBooks]);

  return (
    <div className="books-page">
      <FiltersSidebar 
        books={allBooks} 
        onFilterChange={handleFilterChange} 
      />
      
      <div className="books-content">
        <BookGrid 
          books={filteredBooks} 
          onBookSelect={(book) => {
            if (book.pdf_url) {
              window.open(book.pdf_url, '_blank');
            }
          }}
        />
      </div>
    </div>
  );
}
