'use client';

import { useState, useEffect, useCallback } from 'react';
import { Book, Filters } from '@/lib/types';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './FiltersSidebar.module.css';

interface FiltersSidebarProps {
  books: Book[];
  onFilterChange: (filters: Filters) => void;
}

export default function FiltersSidebar({ books, onFilterChange }: FiltersSidebarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Состояния фильтров
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('categories')?.split(',').filter(Boolean) || []
  );
  const [selectedYear, setSelectedYear] = useState<string>(searchParams.get('year') || 'all');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  );
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(
    searchParams.get('authors')?.split(',').filter(Boolean) || []
  );
  const [yearFrom, setYearFrom] = useState(searchParams.get('yearFrom') || '');
  const [yearTo, setYearTo] = useState(searchParams.get('yearTo') || '');
  
  // Вспомогательные состояния
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Функция для форматирования категории с заглавной буквы
  const formatCategory = (category: string): string => {
    if (!category) return '';
    const trimmed = category.trim();
    if (!trimmed) return '';
    return trimmed
      .toLowerCase()
      .split(/[\s-/]+/)
      .map(word => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  // Получаем и форматируем категории
  const categories = Array.from(
    new Set(
      books
        .map(book => book.category)
        .filter(Boolean)
        .map(cat => formatCategory(cat))
    )
  ).sort();

  const tags = Array.from(new Set(books.flatMap(book => book.tags || []))).slice(0, 10);
  const authors = Array.from(new Set(books.map(book => book.author).filter(Boolean)));

  // Функция применения фильтров
  const applyFilters = useCallback(() => {
    const filters: Filters = {
      search,
      categories: selectedCategories,
      year: selectedYear,
      tags: selectedTags,
      authors: selectedAuthors,
      yearFrom,
      yearTo
    };
    
    // Обновляем URL
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));
    if (selectedYear !== 'all') params.set('year', selectedYear);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (selectedAuthors.length > 0) params.set('authors', selectedAuthors.join(','));
    if (yearFrom) params.set('yearFrom', yearFrom);
    if (yearTo) params.set('yearTo', yearTo);
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
    
    // Передаем фильтры родительскому компоненту
    onFilterChange(filters);
  }, [search, selectedCategories, selectedYear, selectedTags, selectedAuthors, yearFrom, yearTo, router, onFilterChange]);

  // Применяем фильтры при изменении параметров
  useEffect(() => {
    // Если книги загружены и компонент еще не инициализирован
    if (!isInitialized && books.length > 0) {
      setIsInitialized(true);
      // Применяем фильтры из URL сразу при инициализации
      applyFilters();
    } else if (isInitialized) {
      // Применяем фильтры при изменении параметров
      applyFilters();
    }
  }, [search, selectedCategories, selectedYear, selectedTags, selectedAuthors, yearFrom, yearTo, applyFilters, isInitialized, books.length]);

  // Очистка фильтров
  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedYear('all');
    setSelectedTags([]);
    setSelectedAuthors([]);
    setYearFrom('');
    setYearTo('');
  };

  // Обработчики изменения фильтров
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAuthorToggle = (author: string) => {
    setSelectedAuthors(prev =>
      prev.includes(author)
        ? prev.filter(a => a !== author)
        : [...prev, author]
    );
  };

  // Дебаунс для поиска
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Сбрасываем предыдущий таймаут
    if (searchTimeout) clearTimeout(searchTimeout);
    
    // Устанавливаем новый таймаут
    const timeout = setTimeout(() => {
      setSearch(value);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  return (
    <div className={styles.filtersSidebar}>
      <div className={styles.filtersHeader}>
        <h2>Фильтры</h2>
        <button 
          className={styles.clearFilters} 
          onClick={clearFilters}
          title="Сбросить все фильтры"
        >
          <i className="fas fa-times"></i> Сбросить
        </button>
      </div>

      <div className={styles.searchBox}>
        <i className="fas fa-search search-icon"></i>
        <input
          type="text"
          placeholder="Поиск книг..."
          value={search}
          onChange={handleSearchChange}
          aria-label="Поиск книг"
        />
      </div>

      {categories.length > 0 && (
        <div className={styles.filterGroup}>
          <div className={styles.filterTitle}>
            <i className="fas fa-tag"></i>
            <span>Категории</span>
          </div>
          <div className={styles.filterOptions}>
            {categories.map(category => (
              <div key={category} className={styles.filterOption}>
                <input
                  type="checkbox"
                  id={`cat-${category}`}
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  aria-label={`Категория: ${category}`}
                />
                <label htmlFor={`cat-${category}`}>{category}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.filterGroup}>
        <div className={styles.filterTitle}>
          <i className="fas fa-calendar"></i>
          <span>Год издания</span>
        </div>
        <div className={styles.filterOptions}>
          <div className={styles.filterOption}>
            <input
              type="radio"
              id="year-all"
              name="year"
              checked={selectedYear === 'all'}
              onChange={() => setSelectedYear('all')}
              aria-label="Все года"
            />
            <label htmlFor="year-all">Все года</label>
          </div>
          <div className={styles.filterOption}>
            <input
              type="radio"
              id="year-2025"
              name="year"
              checked={selectedYear === '2025'}
              onChange={() => setSelectedYear('2025')}
              aria-label="2025 год"
            />
            <label htmlFor="year-2025">2025</label>
          </div>
          <div className={styles.filterOption}>
            <input
              type="radio"
              id="year-2024"
              name="year"
              checked={selectedYear === '2024'}
              onChange={() => setSelectedYear('2024')}
              aria-label="2024 год"
            />
            <label htmlFor="year-2024">2024</label>
          </div>
          <div className={styles.filterOption}>
            <input
              type="radio"
              id="year-2023"
              name="year"
              checked={selectedYear === '2023-2021'}
              onChange={() => setSelectedYear('2023-2021')}
              aria-label="2023-2021 года"
            />
            <label htmlFor="year-2023">2023-2021</label>
          </div>
          <div className={styles.filterOption}>
            <input
              type="radio"
              id="year-old"
              name="year"
              checked={selectedYear === 'old'}
              onChange={() => setSelectedYear('old')}
              aria-label="До 2021 года"
            />
            <label htmlFor="year-old">До 2021</label>
          </div>
        </div>
        
        <div className={styles.yearRange}>
          <input
            type="number"
            placeholder="От"
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
            min="1900"
            max="2100"
            aria-label="Год от"
          />
          <span>—</span>
          <input
            type="number"
            placeholder="До"
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
            min="1900"
            max="2100"
            aria-label="Год до"
          />
        </div>
      </div>

      {authors.length > 0 && (
        <div className={styles.filterGroup}>
          <div className={styles.filterTitle}>
            <i className="fas fa-user"></i>
            <span>Авторы</span>
          </div>
          <div className={styles.filterOptions}>
            {authors.slice(0, 5).map(author => (
              <div key={author} className={styles.filterOption}>
                <input
                  type="checkbox"
                  id={`author-${author}`}
                  checked={selectedAuthors.includes(author)}
                  onChange={() => handleAuthorToggle(author)}
                  aria-label={`Автор: ${author}`}
                />
                <label htmlFor={`author-${author}`}>{author}</label>
              </div>
            ))}
            {authors.length > 5 && (
              <div className={styles.moreAuthors}>
                <i className="fas fa-ellipsis-h"></i> еще {authors.length - 5} авторов
              </div>
            )}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className={styles.filterGroup}>
          <div className={styles.filterTitle}>
            <i className="fas fa-hashtag"></i>
            <span>Популярные теги</span>
          </div>
          <div className={styles.tagsContainer}>
            {tags.map(tag => (
              <span
                key={tag}
                className={`${styles.tag} ${selectedTags.includes(tag) ? styles.active : ''}`}
                onClick={() => handleTagToggle(tag)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleTagToggle(tag);
                  }
                }}
                aria-label={`Тег: ${tag}`}
                aria-pressed={selectedTags.includes(tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <button 
        className={styles.applyButton} 
        onClick={applyFilters}
        aria-label="Применить фильтры"
      >
        <i className="fas fa-filter"></i> Применить фильтры
      </button>
    </div>
  );
}
