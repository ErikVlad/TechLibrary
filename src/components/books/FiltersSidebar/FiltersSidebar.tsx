'use client';

import { useState, useEffect } from 'react';
import { Book, Filters } from '@/lib/types';
import styles from './FiltersSidebar.module.css';

interface FiltersSidebarProps {
  books: Book[];
  onFilterChange: (filters: Filters) => void;
}

export default function FiltersSidebar({ books, onFilterChange }: FiltersSidebarProps) {
  console.log('🎯 FiltersSidebar: Рендер, книг:', books.length);
  
  // ЛОКАЛЬНОЕ состояние - НЕ СИНХРОНИЗИРУЕМ с родителем
  const [localSearch, setLocalSearch] = useState('');
  const [localCategories, setLocalCategories] = useState<string[]>([]);
  const [localYear, setLocalYear] = useState<string>('all');
  
  // Применить фильтры - ТОЛЬКО ПО КНОПКЕ
  const handleApplyFilters = () => {
    console.log('🎯 FiltersSidebar: Нажата кнопка Применить');
    const filters: Filters = {
      search: localSearch,
      categories: localCategories,
      year: localYear,
      tags: [],
      authors: [],
      yearFrom: '',
      yearTo: ''
    };
    
    onFilterChange(filters);
  };

  // Очистить фильтры
  const handleClearFilters = () => {
    console.log('🎯 FiltersSidebar: Нажата кнопка Сбросить');
    setLocalSearch('');
    setLocalCategories([]);
    setLocalYear('all');
    
    // Отправляем пустые фильтры родителю
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

  // Инициализация - НИЧЕГО НЕ ДЕЛАЕМ
  useEffect(() => {
    console.log('🎯 FiltersSidebar: Монтирование, книги:', books.length);
    // НЕ читаем из URL, НЕ отправляем фильтры автоматически
  }, [books.length]);

  const handleCategoryToggle = (category: string) => {
    setLocalCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

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
          value={localSearch}
          onChange={handleSearchChange}
        />
      </div>

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
                checked={localYear === year}
                onChange={() => setLocalYear(year)}
              />
              <label htmlFor={`year-${year}`}>
                {year === 'all' ? 'Все года' : 
                 year === '2023-2021' ? '2023-2021' : 
                 year === 'old' ? 'До 2021' : year}
              </label>
            </div>
          ))}
        </div>
      </div>

      <button className={styles.applyButton} onClick={handleApplyFilters}>
        <i className="fas fa-filter"></i> Применить фильтры
      </button>
      
      <div style={{ 
        marginTop: '20px', 
        fontSize: '12px', 
        color: '#666',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px'
      }}>
        <strong>Статус отладки:</strong><br />
        • Поиск: "{localSearch}"<br />
        • Год: {localYear}<br />
        • Категорий выбрано: {localCategories.length}<br />
        • Книг доступно: {books.length}
      </div>
    </div>
  );
}
