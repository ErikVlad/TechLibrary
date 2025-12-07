// components/books/FiltersSidebar/FiltersSidebar.tsx
'use client';

import { useState } from 'react';
import { Book, Filters } from '@/lib/types';
import styles from './FiltersSidebar.module.css';

interface FiltersSidebarProps {
  books: Book[];
  onFilterChange: (filters: Filters) => void;
}

export default function FiltersSidebar({ books, onFilterChange }: FiltersSidebarProps) {
  console.log('🎯 FiltersSidebar: Рендер, книг:', books.length);
  
  const [search, setSearch] = useState('');
  
  // Применить фильтры
  const handleApplyFilters = () => {
    console.log('🎯 FiltersSidebar: Нажата кнопка Применить');
    const filters: Filters = {
      search,
      categories: [],
      year: 'all',
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
    setSearch('');
    
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
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
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      <button className={styles.applyButton} onClick={handleApplyFilters}>
        <i className="fas fa-filter"></i> Применить фильтры
      </button>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        Отладка: Поиск: "{search}"
      </div>
    </div>
  );
}
