'use client';

import { useState, useEffect, useCallback } from 'react';
import { Book, Filters } from '@/lib/types';
import styles from './FiltersSidebar.module.css';

interface FiltersSidebarProps {
  books: Book[];
  onFilterChange: (filters: Filters) => void;
}

export default function FiltersSidebar({ books, onFilterChange }: FiltersSidebarProps) {
  // ЛОКАЛЬНЫЕ состояния для UI - ВСЕ ПУСТЫЕ
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

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

  // Применить фильтры
  const handleApplyFilters = () => {
    const filters: Filters = {
      search,
      categories: selectedCategories,
      year: selectedYear,
      tags: selectedTags,
      authors: selectedAuthors,
      yearFrom,
      yearTo
    };
    
    console.log('Фильтры применены:', filters);
    onFilterChange(filters);
  };

  // Очистить фильтры
  const handleClearFilters = () => {
    console.log('Фильтры очищены');
    
    // Сбрасываем локальные состояния
    setSearch('');
    setSelectedCategories([]);
    setSelectedYear('all');
    setSelectedTags([]);
    setSelectedAuthors([]);
    setYearFrom('');
    setYearTo('');
    
    // Отправляем пустые фильтры
    onFilterChange({
      search: '',
      categories: [],
      year: 'all',
      tags: [],
      authors: [],
      yearFrom: '',
      yearTo: ''
    });
  };

  // Обработчики UI
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (searchTimeout) clearTimeout(searchTimeout);
    
    const timeout = setTimeout(() => {
      setSearch(value);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  // Инициализация - ничего не делаем с URL
  useEffect(() => {
    // Ничего не читаем из URL!
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  return (
    <div className={styles.filtersSidebar}>
      <div className={styles.filtersHeader}>
        <h2>Фильтры</h2>
        <button className={styles.clearFilters} onClick={handleClearFilters}>
          <i className="fas fa-times"></i> Сбросить
        </button>
      </div>

      <div className={styles.searchBox}>
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Поиск книг..."
          value={search}
          onChange={handleSearchChange}
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
          {['all', '2025', '2024', '2023-2021', 'old'].map((year) => (
            <div key={year} className={styles.filterOption}>
              <input
                type="radio"
                id={`year-${year}`}
                name="year"
                checked={selectedYear === year}
                onChange={() => setSelectedYear(year)}
              />
              <label htmlFor={`year-${year}`}>
                {year === 'all' ? 'Все года' : 
                 year === '2023-2021' ? '2023-2021' : 
                 year === 'old' ? 'До 2021' : year}
              </label>
            </div>
          ))}
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
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className={styles.filterGroup}>
          <div className={styles.filterTitle}>
            <i className="fas fa-hashtag"></i>
            <span>Теги</span>
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

      <button className={styles.applyButton} onClick={handleApplyFilters}>
        <i className="fas fa-filter"></i> Применить фильтры
      </button>
    </div>
  );
}
