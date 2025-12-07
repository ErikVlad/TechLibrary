'use client';

import { useState, useEffect } from 'react';
import { Book, Filters } from '@/lib/types';
import FiltersSidebar from './FiltersSidebar/FiltersSidebar';
import BookGrid from './BookGrid/BookGrid';
import styles from './ClientBooksSection.module.css';

interface ClientBooksSectionProps {
  initialBooks: Book[];
}

export default function ClientBooksSection({ initialBooks }: ClientBooksSectionProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(initialBooks);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    categories: [],
    year: 'all',
    tags: [],
    authors: [],
    yearFrom: '',
    yearTo: ''
  });

  // Фильтрация книг
  const applyFilters = (booksList: Book[], filterParams: Filters): Book[] => {
    let result = [...booksList];

    // Поиск
    if (filterParams.search) {
      const searchLower = filterParams.search.toLowerCase();
      result = result.filter(book => 
        (book.title && book.title.toLowerCase().includes(searchLower)) ||
        (book.author && book.author.toLowerCase().includes(searchLower)) ||
        (book.description && book.description.toLowerCase().includes(searchLower))
      );
    }

    // Категории
    if (filterParams.categories.length > 0) {
      result = result.filter(book => 
        book.category && filterParams.categories.includes(book.category)
      );
    }

    // Теги
    if (filterParams.tags.length > 0) {
      result = result.filter(book => 
        book.tags && book.tags.some(tag => filterParams.tags.includes(tag))
      );
    }

    // Авторы
    if (filterParams.authors.length > 0) {
      result = result.filter(book => 
        book.author && filterParams.authors.includes(book.author)
      );
    }

    // Год
    if (filterParams.year !== 'all') {
      result = result.filter(book => {
        const year = book.year;
        if (!year) return false;
        
        switch (filterParams.year) {
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
    if (filterParams.yearFrom) {
      const yearFromNum = parseInt(filterParams.yearFrom);
      if (!isNaN(yearFromNum)) {
        result = result.filter(book => book.year && book.year >= yearFromNum);
      }
    }

    if (filterParams.yearTo) {
      const yearToNum = parseInt(filterParams.yearTo);
      if (!isNaN(yearToNum)) {
        result = result.filter(book => book.year && book.year <= yearToNum);
      }
    }

    return result;
  };

  // Обработчик изменения фильтров
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    const filtered = applyFilters(books, newFilters);
    setFilteredBooks(filtered);
  };

  // При инициализации сразу применяем фильтры из URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
      
      setFilters(initialFilters);
      const filtered = applyFilters(books, initialFilters);
      setFilteredBooks(filtered);
    }
  }, [books]);

  // Обновляем при изменении начальных книг
  useEffect(() => {
    setBooks(initialBooks);
    const filtered = applyFilters(initialBooks, filters);
    setFilteredBooks(filtered);
  }, [initialBooks]);

  const handleBookSelect = (book: Book) => {
    if (book.pdf_url) {
      window.open(book.pdf_url, '_blank');
    }
  };

  return (
    <div className={styles.booksSection}>
      <div className={styles.booksHeader}>
        <div>
          <h1>Каталог технической литературы</h1>
          <p className={styles.booksCount}>
            Показано <span>{filteredBooks.length}</span> из <span>{books.length}</span> книг
          </p>
        </div>
      </div>

      <div className={styles.booksContainer}>
        <FiltersSidebar 
          books={books} 
          onFilterChange={handleFilterChange} 
        />
        
        <div className={styles.booksContent}>
          <BookGrid 
            books={filteredBooks} 
            onBookSelect={handleBookSelect}
          />
        </div>
      </div>
    </div>
  );
}
