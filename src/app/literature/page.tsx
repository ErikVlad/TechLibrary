import { Suspense } from 'react';
import { getBooks } from '@/lib/supabase/server';
import FiltersSidebar from '@/components/books/FiltersSidebar/FiltersSidebar';
import ClientBooksSection from '@/components/books/ClientBooksSection';
import { Book, Filters } from '@/lib/types';
import styles from './page.module.css';

// Функция фильтрации книг
function filterBooks(books: Book[], filters: Filters): Book[] {
  return books.filter(book => {
    // Поиск по названию и автору
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower) ||
        book.description?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Фильтр по категориям
    if (filters.categories.length > 0 && !filters.categories.includes(book.category)) {
      return false;
    }

    // Фильтр по авторам
    if (filters.authors.length > 0 && !filters.authors.includes(book.author)) {
      return false;
    }

    // Фильтр по тегам
    if (filters.tags.length > 0 && !book.tags.some(tag => filters.tags.includes(tag))) {
      return false;
    }

    // Фильтр по году
    if (filters.year !== 'all') {
      const bookYear = book.year || 0;
      switch (filters.year) {
        case '2025':
          if (bookYear !== 2025) return false;
          break;
        case '2024':
          if (bookYear !== 2024) return false;
          break;
        case '2023-2021':
          if (bookYear < 2021 || bookYear > 2023) return false;
          break;
        case 'old':
          if (bookYear >= 2021) return false;
          break;
      }
    }

    // Диапазон годов
    if (filters.yearFrom && book.year && book.year < parseInt(filters.yearFrom)) {
      return false;
    }
    if (filters.yearTo && book.year && book.year > parseInt(filters.yearTo)) {
      return false;
    }

    return true;
  });
}

// Клиентский компонент для работы с состоянием фильтров
function LiteratureContent({ allBooks }: { allBooks: Book[] }) {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    categories: [],
    year: 'all',
    tags: [],
    authors: [],
    yearFrom: '',
    yearTo: ''
  });

  const filteredBooks = filterBooks(allBooks, filters);

  return (
    <div className={styles.literaturePage}>
      <aside className={styles.sidebar}>
        <FiltersSidebar 
          books={allBooks} 
          onFilterChange={setFilters}
        />
      </aside>
      <main className={styles.main}>
        <ClientBooksSection initialBooks={filteredBooks} />
      </main>
    </div>
  );
}

// Основная страница (серверный компонент)
export default async function LiteraturePage() {
  const allBooks = await getBooks();

  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <LiteratureContent allBooks={allBooks} />
    </Suspense>
  );
}
