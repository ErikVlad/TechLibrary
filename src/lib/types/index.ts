// src/lib/types/index.ts
export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;  // Изменено: стало необязательным
  year: number;
  pages: number;
  pdf_url?: string | null;
  category?: string;
  tags: string[];
  created_at?: string;
  updated_at?: string;
  cover_url?: string | null;
}

// Для создания новой книги - убираем поля, которые генерируются автоматически
export interface NewBook {
  title: string;
  author: string;
  description?: string;  // Теперь необязательное
  year: number;
  pages: number;
  pdf_url?: string | null;
  category?: string;
  tags: string[];
  cover_url?: string | null;
}

// Упрощенная версия для формы добавления книги
export interface BookFormData {
  title: string;
  author: string;
  description?: string;
  year?: number;
  pages?: number;
  pdf_url?: string;
  category?: string;
  tags?: string[];
}

export interface Filters {
  search?: string;
  categories?: string[];
  authors?: string[];
  tags?: string[];
  year?: string;
  yearFrom?: string;
  yearTo?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}