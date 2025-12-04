// src/lib/types/index.ts
export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  year: number;
  pages: number;
  pdf_url?: string | null;  // Изменено: добавлен null
  category?: string;
  tags: string[];
  created_at?: string;
  updated_at?: string;
  cover_url?: string | null;  // Изменено: добавлен null
}

export interface NewBook extends Omit<Book, 'id' | 'created_at' | 'updated_at'> {
  title: string;
  author: string;
  description: string;
  year: number;
  pages: number;
  pdf_url?: string | null;
  category?: string;
  tags: string[];
  cover_url?: string | null;
}

export interface Filters {
  search: string;
  categories: string[];
  authors: string[];
  tags: string[];
  year: string;
  yearFrom?: string;
  yearTo?: string;
}