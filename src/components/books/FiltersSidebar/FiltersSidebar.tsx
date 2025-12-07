'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Book, Filters } from '@/lib/types';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './FiltersSidebar.module.css';

interface FiltersSidebarProps {
  books: Book[];
  onFilterChange: (filters: Filters) => void;
  externalReset?: string;  // Новый пропс для принудительного сброса
  initialFilters?: Filters | null; // Пропс для начальных фильтров (null для сброса)
}

export default function FiltersSidebar({ 
  books, 
  onFilterChange, 
  externalReset,
  initialFilters = null 
}: FiltersSidebarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Инициализация состояния с возможностью сброса
  const [search, setSearch] = useState(() => {
    if (initialFilters !== null) return initialFilters.search || '';
    return searchParams.get('search') || '';
  });
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    if (initialFilters !== null) return initialFilters.categories || [];
    return searchParams.get('categories')?.split(',').filter(Boolean) || [];
  });
  
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    if (initialFilters !== null) return initialFilters.year || 'all';
    return searchParams.get('year') || 'all';
  });
  
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    if (initialFilters !== null) return initialFilters.tags || [];
    return searchParams.get('tags')?.split(',').filter(Boolean) || [];
  });
  
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(() => {
    if (initialFilters !== null) return initialFilters.authors || [];
    return searchParams.get('authors')?.split(',').filter(Boolean) || [];
  });
  
  const [yearFrom, setYearFrom] = useState(() => {
    if (initialFilters !== null) return initialFilters.yearFrom || '';
    return searchParams.get('yearFrom') || '';
  });
  
  const [yearTo, setYearTo] = useState(() => {
    if (initialFilters !== null) return initialFilters.yearTo || '';
    return searchParams.get('yearTo') || '';
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const prevExternalResetRef = useRef<string | undefined>(externalReset);
  const prevBooksHashRef = useRef<string>('');

  // Создаем хеш текущего набора книг
  const booksHash = books.map(b => b.id).sort().join(',');

  // Получаем уникальные значения из книг
  const categories = Array.from(new Set(books.map(book => book.category))).filter(Boolean);
  const tags = Array.from(new Set(books.flatMap(book => book.tags))).filter(Boolean).slice(0, 10);
  const authors = Array.from(new Set(books.map(book => book.author))).filter(Boolean);

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
      applyFilters();
    } else {
      setIsInitialized(true);
      // При первой загрузке сразу применяем фильтры из URL
      applyFilters();
    }
  }, [search, selectedCategories, selectedYear, selectedTags, selectedAuthors, yearFrom, yearTo]);

  // Сброс фильтров при изменении externalReset или набора книг
  useEffect(() => {
    // Проверяем, изменился ли externalReset (смена пользователя)
    if (externalReset !== prevExternalResetRef.current) {
      console.log('externalReset изменился, сбрасываем фильтры');
      
      // Сбрасываем все фильтры
      setSearch('');
      setSelectedCategories([]);
      setSelectedYear('all');
      setSelectedTags([]);
      setSelectedAuthors([]);
      setYearFrom('');
      setYearTo('');
      
      // Обновляем ref
      prevExternalResetRef.current = externalReset;
      
      // Очищаем URL
      router.replace(window.location.pathname, { scroll: false });
      
      return;
    }
    
    // Проверяем, изменился ли набор книг
    if (booksHash !== prevBooksHashRef.current && books.length > 0) {
      console.log('Набор книг изменился, проверяем актуальность фильтров');
      
      // Проверяем, актуальны ли выбранные категории для нового набора книг
      const updatedCategories = selectedCategories.filter(cat => 
        categories.includes(cat)
      );
      if (updatedCategories.length !== selectedCategories.length) {
        setSelectedCategories(updatedCategories);
      }
      
      // Проверяем актуальность выбранных авторов
      const updatedAuthors = selectedAuthors.filter(author => 
        authors.includes(author)
      );
      if (updatedAuthors.length !== selectedAuthors.length) {
        setSelectedAuthors(updatedAuthors);
      }
      
      // Проверяем актуальность выбранных тегов
      const updatedTags = selectedTags.filter(tag => 
        tags.includes(tag)
      );
      if (updatedTags.length !== selectedTags.length) {
        setSelectedTags(updatedTags);
      }
      
      prevBooksHashRef.current = booksHash;
    }
  }, [externalReset, booksHash, books.length, categories, authors, tags, selectedCategories, selectedAuthors, selectedTags, router]);

  // Очистка фильтров
  const clearFilters = useCallback(() => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedYear('all');
    setSelectedTags([]);
    setSelectedAuthors([]);
    setYearFrom('');
    setYearTo('');
    
    // Очищаем URL
    router.replace(window.location.pathname, { scroll: false });
    
    // Уведомляем родительский компонент о сбросе
    onFilterChange({
      search: '',
      categories: [],
      year: 'all',
      tags: [],
      authors: [],
      yearFrom: '',
      yearTo: ''
    });
  }, [router, onFilterChange]);

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

      <button className={styles.applyButton} onClick={applyFilters}>
        <i className="fas fa-filter"></i> Применить фильтры
      </button>
    </div>
  );
}
