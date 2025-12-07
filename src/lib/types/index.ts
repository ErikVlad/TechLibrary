export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  year: number;
  pages: number;
  pdf_url: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Filters {
  search: string;
  categories: string[];
  authors: string[];
  tags: string[];
  year: string;
  yearFrom: string;
  yearTo: string;
}

export interface FiltersSidebarProps {
  books: Book[];
  onFilterChange: (filters: Filters) => void;
  onResetFilters?: () => void;
}

export interface FilterSection {
  id: string;
  title: string;
  icon: string;
  badge?: number;
  content: React.ReactNode;
}
