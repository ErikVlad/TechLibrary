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
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Функция для форматирования категории с заглавной буквы
  const formatCategory = (category: string): string => {
    if (!category) return '';
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  const categories = Array.from(new Set(books.map(book => book.category).filter(Boolean)));
  const tags = Array.from(new Set(books.flatMap(book => book.tags || []))).slice(0, 10);
  const authors = Array.from(new Set(books.map(book => book.author).filter(Boolean)));

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
    
    onFilterChange(filters);
  }, [search, selectedCategories, selectedYear, selectedTags, selectedAuthors, yearFrom, yearTo, router, onFilterChange]);

  useEffect(() => {
    if (isInitialized) {
      applyFilters();
    } else {
      setIsInitialized(true);
      applyFilters();
    }
  }, [search, selectedCategories, selectedYear, selectedTags, selectedAuthors, yearFrom, yearTo]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedYear('all');
    setSelectedTags([]);
    setSelectedAuthors([]);
    setYearFrom('');
    setYearTo('');
    
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (searchTimeout) clearTimeout(searchTimeout);
    
    const timeout = setTimeout(() => {
      setSearch(value);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  return (
    <div className={styles.filtersSidebar}>
      <div className={styles.filtersHeader}>
        <h2>Фильтры</h2>
        <button className={styles.clearFilters} onClick={clearFilters}>
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
                <label htmlFor={`cat-${category}`}>{formatCategory(category)}</label>
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

      <button className={styles.applyButton} onClick={applyFilters}>
        <i className="fas fa-filter"></i> Применить фильтры
      </button>
    </div>
  );
}
