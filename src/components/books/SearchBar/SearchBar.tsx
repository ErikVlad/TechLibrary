'use client';

import { useState, useEffect } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  delay?: number;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Поиск книг...",
  delay = 300 
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay, onSearch]);

  return (
    <div className={styles.searchBox}>
      <i className="fas fa-search"></i>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
