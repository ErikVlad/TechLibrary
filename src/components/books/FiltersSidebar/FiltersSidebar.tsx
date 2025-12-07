'use client';

import { Book, Filters } from '@/lib/types';
import styles from './FiltersSidebar.module.css';

interface FiltersSidebarProps {
  books: Book[];
  onFilterChange: (filters: Filters) => void;
}

export default function FiltersSidebar({ books }: FiltersSidebarProps) {
  console.log('🎯 FiltersSidebar: Рендер, книг:', books.length);

  return (
    <div className={styles.filtersSidebar}>
      <div className={styles.filtersHeader}>
        <h2>Фильтры</h2>
        <button 
          className={styles.clearFilters}
          onClick={() => alert('Фильтры временно отключены')}
        >
          <i className="fas fa-times"></i> Сбросить
        </button>
      </div>

      <div className={styles.searchBox}>
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Фильтры временно отключены"
          disabled
        />
      </div>

      <button className={styles.applyButton} disabled>
        <i className="fas fa-filter"></i> Фильтры отключены
      </button>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '10px',
        backgroundColor: '#f0f8ff',
        borderRadius: '5px',
        fontSize: '12px',
        color: '#333'
      }}>
        <strong>Статус:</strong><br />
        • Фильтры временно отключены<br />
        • Книг доступно: {books.length}<br />
        • Проблема решается
      </div>
    </div>
  );
}
