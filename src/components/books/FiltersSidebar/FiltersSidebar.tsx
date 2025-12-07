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
  
  // Инициализируем состояние из URL параметров
  const initialSearch = searchParams.get('search') || '';
  const initialCategories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
  const initialYear = searchParams.get('year') || 'all';
  const initialTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const initialAuthors = searchParams.get('authors')?.split(',').filter(Boolean) || [];
  const initialYearFrom = searchParams.get('yearFrom') || '';
  const initialYearTo = searchParams.get('yearTo') || '';
  
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [selectedYear, setSelectedYear] = useState<string>(initialYear);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(initialAuthors);
  const [yearFrom, setYearFrom] = useState(initialYearFrom);
  const [yearTo, setYearTo] = useState(initialYearTo);
  const [isInitialized, setIsInitialized] = useState(false);

  // Получаем уникальные значения из книг с фильтрацией undefined
  const categories = Array.from(new Set(books
    .map(book => book.category)
    .filter((category): category is string => Boolean(category))
  ));

  const tags = Array.from(new Set(books
    .flatMap(book => book.tags || [])
    .filter((tag): tag is string => Boolean(tag))
  )).slice(0, 10);

  const authors = Array.from(new Set(books
    .map(book => book.author)
    .filter((author): author is string => Boolean(author))
  ));

  // Функция для применения фильтров с обновлением URL
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
    
    // Обновляем URL параметры
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));
    if (selectedYear !== 'all') params.set('year', selectedYear);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (selectedAuthors.length > 0) params.set('authors', selectedAuthors.join(','));
    if (yearFrom) params.set('yearFrom', yearFrom);
    if (yearTo) params.set('yearTo', yearTo);
    
    // Обновляем URL без перезагрузки страницы
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
    
    // Передаем фильтры родительскому компоненту
    onFilterChange(filters);
  }, [search, selectedCategories, selectedYear, selectedTags, selectedAuthors, yearFrom, yearTo, router, onFilterChange]);

  // Применяем фильтры при изменении состояния
  useEffect(() => {
    if (isInitialized) {
      // Используем setTimeout для предотвращения множественных вызовов
      const timer = setTimeout(() => {
        applyFilters();
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setIsInitialized(true);
      // При первой загрузке сразу применяем фильтры из URL
      applyFilters();
    }
  }, [
    search, 
    selectedCategories, 
    selectedYear, 
    selectedTags, 
    selectedAuthors, 
    yearFrom, 
    yearTo, 
    applyFilters, 
    isInitialized
  ]);

  // Очистка фильтров
  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedYear('all');
    setSelectedTags([]);
    setSelectedAuthors([]);
    setYearFrom('');
    setYearTo('');
    
    // Очищаем URL
    router.replace(window.location.pathname, { scroll: false });
  };

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
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Отменяем предыдущий таймаут
    if (searchTimeout) clearTimeout(searchTimeout);
    
    // Устанавливаем новый таймаут для дебаунса
    const timeout = setTimeout(() => {
      setSearch(value);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  // Очищаем таймаут при размонтировании
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
          type="button" 
          className={styles.clearFilters} 
          onClick={clearFilters}
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
        />
      </div>

      {/* Категории */}
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
                />
                <label htmlFor={`cat-${category}`}>{category}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Год издания */}
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
          />
          <span>—</span>
          <input
            type="number"
            placeholder="До"
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
            min="1900"
            max="2100"
          />
        </div>
      </div>

      {/* Авторы */}
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

      {/* Теги */}
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
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <button 
        type="button" 
        className={styles.applyButton} 
        onClick={applyFilters}
      >
        <i className="fas fa-filter"></i> Применить фильтры
      </button>
    </div>
  );
}
