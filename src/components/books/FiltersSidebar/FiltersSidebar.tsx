'use client';

import { useState, useEffect, useRef } from 'react';
import { Book, Filters } from '@/lib/types';
import styles from './FiltersSidebar.module.css';

interface FiltersSidebarProps {
  books: Book[];
  onFilterChange: (filters: Filters) => void;
}

export default function FiltersSidebar({ books, onFilterChange }: FiltersSidebarProps) {
  console.log('🎯 FiltersSidebar: Рендер');
  
  // Используем ref для контроля первой инициализации
  const hasSentInitialFilters = useRef(false);
  
  // ЛОКАЛЬНОЕ состояние
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [year, setYear] = useState<string>('all');
  
  // ПРИМЕНЕНИЕ ФИЛЬТРОВ - только по явному действию
  const applyFilters = () => {
    console.log('🔘 FiltersSidebar: Кнопка "Применить" нажата');
    const filters: Filters = {
      search,
      categories,
      year,
      tags: [],
      authors: [],
      yearFrom: '',
      yearTo: ''
    };
    
    onFilterChange(filters);
  };
  
  // СБРОС ФИЛЬТРОВ
  const clearFilters = () => {
    console.log('🔘 FiltersSidebar: Кнопка "Сбросить" нажата');
    setSearch('');
    setCategories([]);
    setYear('all');
    
    // Отправляем ПУСТЫЕ фильтры
    onFilterChange({
      search: '',
      categories: [],
      year: 'all',
      tags: [],
      authors: [],
      yearFrom: '',
      yearTo: ''
    });
    
    // Сбрасываем флаг
    hasSentInitialFilters.current = true;
  };
  
  // ИНИЦИАЛИЗАЦИЯ - НИЧЕГО НЕ ОТПРАВЛЯЕМ
  useEffect(() => {
    console.log('🔄 FiltersSidebar: Монтирование');
    
    // НЕ отправляем фильтры при инициализации
    // hasSentInitialFilters.current остается false
    
    return () => {
      console.log('🧹 FiltersSidebar: Размонтирование');
    };
  }, []);
  
  // Обработчики UI
  const handleCategoryToggle = (category: string) => {
    setCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className={styles.filtersSidebar}>
      <div className={styles.filtersHeader}>
        <h2>Фильтры</h2>
        <button className={styles.clearFilters} onClick={clearFilters}>
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

      <div className={styles.filterGroup}>
        <div className={styles.filterTitle}>
          <i className="fas fa-calendar"></i>
          <span>Год издания</span>
        </div>
        <div className={styles.filterOptions}>
          {['all', '2025', '2024', '2023-2021', 'old'].map((yearOption) => (
            <div key={yearOption} className={styles.filterOption}>
              <input
                type="radio"
                id={`year-${yearOption}`}
                name="year"
                checked={year === yearOption}
                onChange={() => setYear(yearOption)}
              />
              <label htmlFor={`year-${yearOption}`}>
                {yearOption === 'all' ? 'Все года' : 
                 yearOption === '2023-2021' ? '2023-2021' : 
                 yearOption === 'old' ? 'До 2021' : yearOption}
              </label>
            </div>
          ))}
        </div>
      </div>

      <button className={styles.applyButton} onClick={applyFilters}>
        <i className="fas fa-filter"></i> Применить фильтры
      </button>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '10px',
        backgroundColor: '#f0f8ff',
        borderRadius: '5px',
        fontSize: '12px',
        color: '#333'
      }}>
        <strong>Фильтры:</strong><br />
        • Поиск: "{search}"<br />
        • Год: {year}<br />
        • Категорий: {categories.length}
      </div>
    </div>
  );
}
