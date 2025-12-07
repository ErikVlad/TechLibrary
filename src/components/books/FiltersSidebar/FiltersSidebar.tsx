'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Book, Filters, FiltersSidebarProps } from '@/lib/types';
import styles from './FiltersSidebar.module.css';

export default function FiltersSidebar({ 
  books, 
  onFilterChange, 
  onResetFilters 
}: FiltersSidebarProps) {
  // Состояния для фильтров
  const [filters, setFilters] = useState<Filters>({
    search: '',
    categories: [],
    authors: [],
    tags: [],
    year: 'all',
    yearFrom: '',
    yearTo: ''
  });
  
  // Состояния для доступных опций
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableAuthors, setAvailableAuthors] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // Состояния для UI
  const [expandedSection, setExpandedSection] = useState<string>('all');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  
  // Ref для дебаунса
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Извлекаем уникальные значения из книг
  useEffect(() => {
    if (books.length === 0) return;
    
    // Категории
    const categories = Array.from(
      new Set(books
        .map(book => book.category)
        .filter(Boolean) as string[]
      )
    ).sort();
    
    // Авторы
    const authors = Array.from(
      new Set(books
        .map(book => book.author)
        .filter(Boolean) as string[]
      )
    ).sort();
    
    // Теги
    const allTags = books
      .flatMap(book => book.tags || [])
      .filter(Boolean);
    
    const tags = Array.from(new Set(allTags)).sort();
    
    setAvailableCategories(categories);
    setAvailableAuthors(authors);
    setAvailableTags(tags);
  }, [books]);

  // Дебаунс для применения фильтров
  const applyFiltersWithDebounce = useCallback((newFilters: Filters) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      onFilterChange(newFilters);
    }, 300);
  }, [onFilterChange]);

  // Обработчики изменений фильтров
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, search: e.target.value };
    setFilters(newFilters);
    applyFiltersWithDebounce(newFilters);
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    applyFiltersWithDebounce(newFilters);
  };

  const handleAuthorToggle = (author: string) => {
    const newAuthors = filters.authors.includes(author)
      ? filters.authors.filter(a => a !== author)
      : [...filters.authors, author];
    
    const newFilters = { ...filters, authors: newAuthors };
    setFilters(newFilters);
    applyFiltersWithDebounce(newFilters);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    const newFilters = { ...filters, tags: newTags };
    setFilters(newFilters);
    applyFiltersWithDebounce(newFilters);
  };

  const handleYearChange = (year: string) => {
    const newFilters = { ...filters, year };
    setFilters(newFilters);
    applyFiltersWithDebounce(newFilters);
  };

  const handleYearFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, yearFrom: e.target.value };
    setFilters(newFilters);
    applyFiltersWithDebounce(newFilters);
  };

  const handleYearToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, yearTo: e.target.value };
    setFilters(newFilters);
    applyFiltersWithDebounce(newFilters);
  };

  // Сброс всех фильтров
  const handleResetAllFilters = () => {
    const resetFilters: Filters = {
      search: '',
      categories: [],
      authors: [],
      tags: [],
      year: 'all',
      yearFrom: '',
      yearTo: ''
    };
    
    setFilters(resetFilters);
    onFilterChange(resetFilters);
    
    // Вызываем внешний callback если он есть
    if (onResetFilters) {
      onResetFilters();
    }
  };

  // Переключение секций
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? 'none' : section);
  };

  // Сброс конкретного фильтра
  const resetFilter = (filterType: keyof Filters) => {
    let resetValue: any;
    
    switch (filterType) {
      case 'search':
        resetValue = '';
        break;
      case 'categories':
      case 'authors':
      case 'tags':
        resetValue = [];
        break;
      case 'year':
        resetValue = 'all';
        break;
      case 'yearFrom':
      case 'yearTo':
        resetValue = '';
        break;
    }
    
    const newFilters = { ...filters, [filterType]: resetValue };
    setFilters(newFilters);
    applyFiltersWithDebounce(newFilters);
  };

  // Подсчет активных фильтров
  const activeFilterCount = 
    (filters.search ? 1 : 0) +
    filters.categories.length +
    filters.authors.length +
    filters.tags.length +
    (filters.year !== 'all' ? 1 : 0) +
    (filters.yearFrom ? 1 : 0) +
    (filters.yearTo ? 1 : 0);

  // Очищаем таймаут при размонтировании
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Секции фильтров
  const filterSections = [
    {
      id: 'search',
      title: 'Поиск',
      icon: 'fas fa-search',
      content: (
        <div className={styles.searchSection}>
          <div className={styles.searchInputWrapper}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Поиск по названию, автору..."
              value={filters.search}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
            {filters.search && (
              <button 
                onClick={() => resetFilter('search')}
                className={styles.clearSearchBtn}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'categories',
      title: 'Категории',
      icon: 'fas fa-tags',
      badge: filters.categories.length,
      content: (
        <div className={styles.filterList}>
          {availableCategories.map(category => (
            <label key={category} className={styles.filterCheckbox}>
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
              />
              <span className={styles.checkmark}></span>
              <span className={styles.filterLabel}>{category}</span>
            </label>
          ))}
          {availableCategories.length === 0 && (
            <p className={styles.noOptions}>Категории не найдены</p>
          )}
        </div>
      )
    },
    {
      id: 'authors',
      title: 'Авторы',
      icon: 'fas fa-user-edit',
      badge: filters.authors.length,
      content: (
        <div className={styles.filterList}>
          {availableAuthors.map(author => (
            <label key={author} className={styles.filterCheckbox}>
              <input
                type="checkbox"
                checked={filters.authors.includes(author)}
                onChange={() => handleAuthorToggle(author)}
              />
              <span className={styles.checkmark}></span>
              <span className={styles.filterLabel}>{author}</span>
            </label>
          ))}
          {availableAuthors.length === 0 && (
            <p className={styles.noOptions}>Авторы не найдены</p>
          )}
        </div>
      )
    },
    {
      id: 'tags',
      title: 'Теги',
      icon: 'fas fa-hashtag',
      badge: filters.tags.length,
      content: (
        <div className={styles.filterList}>
          {availableTags.map(tag => (
            <label key={tag} className={styles.filterCheckbox}>
              <input
                type="checkbox"
                checked={filters.tags.includes(tag)}
                onChange={() => handleTagToggle(tag)}
              />
              <span className={styles.checkmark}></span>
              <span className={styles.filterLabel}>{tag}</span>
            </label>
          ))}
          {availableTags.length === 0 && (
            <p className={styles.noOptions}>Теги не найдены</p>
          )}
        </div>
      )
    },
    {
      id: 'year',
      title: 'Год издания',
      icon: 'fas fa-calendar-alt',
      badge: filters.year !== 'all' || filters.yearFrom || filters.yearTo ? 1 : 0,
      content: (
        <div className={styles.yearSection}>
          <div className={styles.yearPresets}>
            <button
              className={`${styles.yearBtn} ${filters.year === 'all' ? styles.active : ''}`}
              onClick={() => handleYearChange('all')}
            >
              Все годы
            </button>
            <button
              className={`${styles.yearBtn} ${filters.year === '2025' ? styles.active : ''}`}
              onClick={() => handleYearChange('2025')}
            >
              2025
            </button>
            <button
              className={`${styles.yearBtn} ${filters.year === '2024' ? styles.active : ''}`}
              onClick={() => handleYearChange('2024')}
            >
              2024
            </button>
            <button
              className={`${styles.yearBtn} ${filters.year === '2023-2021' ? styles.active : ''}`}
              onClick={() => handleYearChange('2023-2021')}
            >
              2021-2023
            </button>
            <button
              className={`${styles.yearBtn} ${filters.year === 'old' ? styles.active : ''}`}
              onClick={() => handleYearChange('old')}
            >
              До 2021
            </button>
          </div>
          
          <div className={styles.yearRange}>
            <p className={styles.rangeLabel}>Диапазон лет:</p>
            <div className={styles.rangeInputs}>
              <div className={styles.rangeInputGroup}>
                <label>От</label>
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  value={filters.yearFrom}
                  onChange={handleYearFromChange}
                  placeholder="2020"
                  className={styles.rangeInput}
                />
                {filters.yearFrom && (
                  <button 
                    onClick={() => resetFilter('yearFrom')}
                    className={styles.clearRangeBtn}
                  >
                    ×
                  </button>
                )}
              </div>
              <div className={styles.rangeInputGroup}>
                <label>До</label>
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  value={filters.yearTo}
                  onChange={handleYearToChange}
                  placeholder="2025"
                  className={styles.rangeInput}
                />
                {filters.yearTo && (
                  <button 
                    onClick={() => resetFilter('yearTo')}
                    className={styles.clearRangeBtn}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* Заголовок панели фильтров */}
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <h3 className={styles.title}>
            <i className="fas fa-filter"></i>
            Фильтры
            {activeFilterCount > 0 && (
              <span className={styles.activeFiltersBadge}>
                {activeFilterCount}
              </span>
            )}
          </h3>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={styles.collapseBtn}
            title={isCollapsed ? "Развернуть" : "Свернуть"}
          >
            <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'}`}></i>
          </button>
        </div>
        
        <div className={styles.headerActions}>
          {activeFilterCount > 0 && (
            <button 
              onClick={handleResetAllFilters}
              className={styles.resetAllBtn}
            >
              <i className="fas fa-redo"></i>
              Сбросить все
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Быстрый сброс активных фильтров */}
          {activeFilterCount > 0 && (
            <div className={styles.activeFilters}>
              <p className={styles.activeFiltersTitle}>Активные фильтры:</p>
              <div className={styles.activeFiltersList}>
                {filters.search && (
                  <span className={styles.activeFilterTag}>
                    Поиск: "{filters.search}"
                    <button 
                      onClick={() => resetFilter('search')}
                      className={styles.removeFilterBtn}
                    >
                      ×
                    </button>
                  </span>
                )}
                
                {filters.categories.map(category => (
                  <span key={`cat-${category}`} className={styles.activeFilterTag}>
                    {category}
                    <button 
                      onClick={() => handleCategoryToggle(category)}
                      className={styles.removeFilterBtn}
                    >
                      ×
                    </button>
                  </span>
                ))}
                
                {filters.authors.map(author => (
                  <span key={`author-${author}`} className={styles.activeFilterTag}>
                    {author}
                    <button 
                      onClick={() => handleAuthorToggle(author)}
                      className={styles.removeFilterBtn}
                    >
                      ×
                    </button>
                  </span>
                ))}
                
                {filters.tags.map(tag => (
                  <span key={`tag-${tag}`} className={styles.activeFilterTag}>
                    #{tag}
                    <button 
                      onClick={() => handleTagToggle(tag)}
                      className={styles.removeFilterBtn}
                    >
                      ×
                    </button>
                  </span>
                ))}
                
                {filters.year !== 'all' && (
                  <span className={styles.activeFilterTag}>
                    Год: {filters.year}
                    <button 
                      onClick={() => resetFilter('year')}
                      className={styles.removeFilterBtn}
                    >
                      ×
                    </button>
                  </span>
                )}
                
                {filters.yearFrom && (
                  <span className={styles.activeFilterTag}>
                    От {filters.yearFrom} г.
                    <button 
                      onClick={() => resetFilter('yearFrom')}
                      className={styles.removeFilterBtn}
                    >
                      ×
                    </button>
                  </span>
                )}
                
                {filters.yearTo && (
                  <span className={styles.activeFilterTag}>
                    До {filters.yearTo} г.
                    <button 
                      onClick={() => resetFilter('yearTo')}
                      className={styles.removeFilterBtn}
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Основные секции фильтров */}
          <div className={styles.filterSections}>
            {filterSections.map(section => (
              <div 
                key={section.id} 
                className={`${styles.filterSection} ${expandedSection === section.id || expandedSection === 'all' ? styles.expanded : ''}`}
              >
                <button 
                  className={styles.sectionHeader}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className={styles.sectionTitle}>
                    <i className={section.icon}></i>
                    <span>{section.title}</span>
                    {section.badge && section.badge > 0 && (
                      <span className={styles.sectionBadge}>
                        {section.badge}
                      </span>
                    )}
                  </div>
                  <i className={`fas fa-chevron-${expandedSection === section.id ? 'up' : 'down'}`}></i>
                </button>
                
                <div className={styles.sectionContent}>
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Быстрые действия */}
          <div className={styles.quickActions}>
            <button 
              onClick={() => setExpandedSection('all')}
              className={styles.quickActionBtn}
            >
              <i className="fas fa-expand-alt"></i>
              Развернуть все
            </button>
            <button 
              onClick={() => setExpandedSection('none')}
              className={styles.quickActionBtn}
            >
              <i className="fas fa-compress-alt"></i>
              Свернуть все
            </button>
          </div>
        </>
      )}

      {/* Состояние свернутой панели */}
      {isCollapsed && activeFilterCount > 0 && (
        <div className={styles.collapsedInfo}>
          <div className={styles.collapsedBadge}>
            <i className="fas fa-filter"></i>
            <span>{activeFilterCount}</span>
          </div>
          <button 
            onClick={handleResetAllFilters}
            className={styles.collapsedResetBtn}
            title="Сбросить все фильтры"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    </div>
  );
}
