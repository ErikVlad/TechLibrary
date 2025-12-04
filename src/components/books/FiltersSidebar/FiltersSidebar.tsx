'use client';

import { useState, useEffect } from 'react';
import { Book, Filters } from '@/lib/types';
import styles from './FiltersSidebar.module.css';

interface FiltersSidebarProps {
  books: Book[];
  onFilterChange: (filters: Filters) => void;
}

export default function FiltersSidebar({ books, onFilterChange }: FiltersSidebarProps) {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  
  // Получаем уникальные значения из книг
  const categories = Array.from(new Set(books.map(book => book.category)));
  const tags = Array.from(new Set(books.flatMap(book => book.tags))).slice(0, 10);
  const authors = Array.from(new Set(books.map(book => book.author)));

  // Автоматически применяем фильтры при их изменении
  useEffect(() => {
    applyFilters();
  }, [search, selectedCategories, selectedYear, selectedTags, selectedAuthors, yearFrom, yearTo]);

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

  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedYear('all');
    setSelectedTags([]);
    setSelectedAuthors([]);
    setYearFrom('');
    setYearTo('');
  };

  const applyFilters = () => {
    const filters: Filters = {
      search,
      categories: selectedCategories,
      year: selectedYear,
      tags: selectedTags,
      authors: selectedAuthors,
      yearFrom,
      yearTo
    };
    onFilterChange(filters);
  };

  // Дебаунс для поиска
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
        <i className="fas fa-search search-icon"></i>
        <input
          type="text"
          placeholder="Поиск книг..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {/* Категории */}
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

      {/* Теги */}
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

      <button className={styles.applyButton} onClick={applyFilters}>
        <i className="fas fa-filter"></i> Применить фильтры
      </button>
    </div>
  );
}