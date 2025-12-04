// src/app/admin-panel/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Book, NewBook } from '@/lib/types';
import AddBookForm from './AddBookForm';
import EditBookForm from './EditBookForm';
import BookList from './BookList';
import './admin-panel.css';

const debugLog = (...args: unknown[]) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] DEBUG:`, ...args);
};

const debugError = (...args: unknown[]) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ERROR:`, ...args);
};

// Тип для данных книги при отправке в Supabase
interface BookData {
  title: string;
  author: string;
  description: string;
  year: number;
  pages: number;
  category: string;
  tags: string[];
  pdf_url: string | null;
  created_at: string;
  // Добавляем только если столбец есть в таблице
  // cover_url?: string | null;
}

// Тип для данных обновления книги
interface UpdateBookData {
  title: string;
  author: string;
  description: string;
  year: number;
  pages: number;
  category: string;
  tags: string[];
  pdf_url: string | null;
  // Добавляем только если столбец есть в таблице
  // cover_url?: string | null;
}

export default function AdminPanel() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  // Проверяем Storage
  useEffect(() => {
    const checkStorage = async () => {
      try {
        debugLog('Проверка Storage...');
        
        // Просто проверяем, доступен ли bucket
        // Убрали неиспользуемую переменную data
        const { error } = await supabase.storage
          .from('pdf-books')
          .list();
        
        if (error && error.message.includes('does not exist')) {
          debugError('Bucket pdf-books не существует');
          debugError('Создайте bucket вручную в Supabase Dashboard:');
          debugError('1. Storage → New bucket');
          debugError('2. Name: pdf-books');
          debugError('3. Public: Yes');
          debugError('4. File size limit: 50MB');
        } else if (error) {
          debugError('Ошибка проверки Storage:', error.message);
        } else {
          debugLog('Storage доступен');
          setStorageReady(true);
        }
      } catch (error) {
        debugError('Ошибка проверки Storage:', error);
      }
    };
    
    checkStorage();
  }, []);

  // Загрузка книг
  const fetchBooks = async () => {
    try {
      debugLog('Начало загрузки книг...');
      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        debugError('Ошибка загрузки книг:', error);
        throw error;
      }
      
      debugLog(`Успешно загружено книг: ${data?.length || 0}`);
      
      // Преобразуем данные к типу Book
      const formattedBooks: Book[] = (data || []).map(book => ({
        id: book.id,
        title: book.title || '',
        author: book.author || '',
        description: book.description || '',
        year: book.year || new Date().getFullYear(),
        pages: book.pages || 0,
        category: book.category || 'programming',
        tags: book.tags || [],
        pdf_url: book.pdf_url || null,
        // cover_url может отсутствовать в таблице
        ...(book.cover_url !== undefined && { cover_url: book.cover_url || null }),
        created_at: book.created_at,
        updated_at: book.updated_at,
      }));
      
      setBooks(formattedBooks);
    } catch (error) {
      debugError('Критическая ошибка загрузки книг:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Загрузка PDF в Supabase Storage
  const uploadPDF = async (file: File): Promise<string | null> => {
    if (!storageReady) {
      debugError('Storage не готов. Создайте bucket pdf-books в Supabase Dashboard');
      return null;
    }
    
    try {
      debugLog('Начало загрузки PDF файла:', file.name, `${(file.size / 1024 / 1024).toFixed(2)} MB`);
      setUploadingPDF(true);
      
      // Проверяем размер файла
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('Файл слишком большой. Максимальный размер: 50MB');
      }
      
      // Проверяем тип файла
      if (!file.type.includes('pdf')) {
        throw new Error('Файл должен быть в формате PDF');
      }
      
      // Генерируем уникальное имя файла
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      debugLog('Загрузка в Storage:', fileName);
      
      const { error: uploadError } = await supabase.storage
        .from('pdf-books')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf'
        });
      
      if (uploadError) {
        debugError('Ошибка загрузки в Storage:', uploadError.message);
        return null;
      }
      
      debugLog('Файл загружен в Storage');
      
      // Получаем публичный URL
      const { data: { publicUrl } } = supabase.storage
        .from('pdf-books')
        .getPublicUrl(fileName);
      
      debugLog('Публичный URL получен:', publicUrl);
      return publicUrl;
    } catch (error) {
      debugError('Ошибка загрузки PDF:', error);
      return null;
    } finally {
      setUploadingPDF(false);
    }
  };

  // Добавление книги - ИСПРАВЛЕННАЯ ВЕРСИЯ
  const handleAddBook = async (newBook: NewBook, pdfFile?: File) => {
    debugLog('Начало добавления книги:', newBook.title);
    
    // Подготавливаем данные для вставки - БЕЗ cover_url
    const bookData: BookData = {
      title: newBook.title || '',
      author: newBook.author || '',
      description: newBook.description || '',
      year: newBook.year || new Date().getFullYear(),
      pages: newBook.pages || 0,
      category: newBook.category || 'programming',
      tags: newBook.tags || [],
      pdf_url: newBook.pdf_url || null,
      created_at: new Date().toISOString(),
    };
    
    // Добавляем cover_url только если столбец есть в таблице
    // Проверьте в Supabase: есть ли столбец cover_url в таблице books
    // Если нет, удалите эту строку:
    // bookData.cover_url = newBook.cover_url || null;

    debugLog('Подготовленные данные:', bookData);

    try {
      let pdfUrl = bookData.pdf_url;
      
      if (pdfFile) {
        debugLog('Загрузка PDF файла...');
        const uploadedUrl = await uploadPDF(pdfFile);
        if (uploadedUrl) {
          pdfUrl = uploadedUrl;
          debugLog('PDF успешно загружен:', uploadedUrl);
        } else {
          debugLog('Не удалось загрузить PDF');
        }
      }
      
      bookData.pdf_url = pdfUrl;
      
      debugLog('Отправка в Supabase:', bookData);
      
      const { data, error } = await supabase
        .from('books')
        .insert([bookData])
        .select();

      if (error) {
        debugError('Ошибка Supabase:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        
        if (error.code === '23505') {
          throw new Error('Книга с таким названием уже существует');
        } else if (error.code === '42501') {
          throw new Error('Нет прав для добавления книги');
        } else if (error.message.includes('cover_url')) {
          throw new Error('Столбец cover_url не найден в таблице. Удалите cover_url из данных');
        }
        
        throw error;
      }
      
      if (data && data.length > 0) {
        const newBook: Book = {
          id: data[0].id,
          title: data[0].title,
          author: data[0].author,
          description: data[0].description || '',
          year: data[0].year,
          pages: data[0].pages,
          category: data[0].category || 'programming',
          tags: data[0].tags || [],
          pdf_url: data[0].pdf_url || null,
          // cover_url может отсутствовать
          ...(data[0].cover_url !== undefined && { cover_url: data[0].cover_url || null }),
          created_at: data[0].created_at,
          updated_at: data[0].updated_at,
        };
        
        debugLog('Книга добавлена:', newBook);
        setBooks([newBook, ...books]);
        return { 
          success: true, 
          message: 'Книга успешно добавлена!' 
        };
      } else {
        throw new Error('Книга не была добавлена');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      debugError('Ошибка добавления книги:', errorMessage);
      
      return { 
        success: false, 
        message: `Ошибка: ${errorMessage}` 
      };
    }
  };

  // Обновление книги
  const handleUpdateBook = async (updatedBook: Book, pdfFile?: File) => {
    debugLog('Обновление книги:', updatedBook.id, updatedBook.title);

    try {
      let pdfUrl = updatedBook.pdf_url || null;
      
      if (pdfFile) {
        const uploadedUrl = await uploadPDF(pdfFile);
        if (uploadedUrl) {
          pdfUrl = uploadedUrl;
        }
      }
      
      // Данные для обновления - БЕЗ cover_url
      const updateData: UpdateBookData = {
        title: updatedBook.title,
        author: updatedBook.author,
        description: updatedBook.description || '',
        year: updatedBook.year,
        pages: updatedBook.pages,
        category: updatedBook.category || 'programming',
        tags: updatedBook.tags || [],
        pdf_url: pdfUrl,
      };
      
      // Добавляем cover_url только если столбец есть
      // Если столбца нет, удалите эту строку:
      // if (updatedBook.cover_url !== undefined) {
      //   (updateData as any).cover_url = updatedBook.cover_url;
      // }
      
      debugLog('Данные для обновления:', updateData);
      
      const { data, error } = await supabase
        .from('books')
        .update(updateData)
        .eq('id', updatedBook.id)
        .select();

      if (error) {
        debugError('Ошибка обновления:', {
          message: error.message,
          code: error.code,
          details: error.details
        });
        throw error;
      }
      
      if (data && data.length > 0) {
        const updated: Book = {
          id: data[0].id,
          title: data[0].title,
          author: data[0].author,
          description: data[0].description || '',
          year: data[0].year,
          pages: data[0].pages,
          category: data[0].category || 'programming',
          tags: data[0].tags || [],
          pdf_url: data[0].pdf_url || null,
          // cover_url может отсутствовать
          ...(data[0].cover_url !== undefined && { cover_url: data[0].cover_url || null }),
          created_at: data[0].created_at,
          updated_at: data[0].updated_at,
        };
        
        setBooks(books.map(book => 
          book.id === updated.id ? updated : book
        ));
        setEditingBook(null);
        
        return { 
          success: true, 
          message: 'Книга успешно обновлена!' 
        };
      }
      
      throw new Error('Книга не была обновлена');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      debugError('Ошибка обновления книги:', errorMessage);
      
      return { 
        success: false, 
        message: `Ошибка: ${errorMessage}` 
      };
    }
  };

  // Удаление книги
  const handleDeleteBook = async (id: string): Promise<{ success: boolean; message: string }> => {
    debugLog('Удаление книги:', id);
    
    if (!confirm('Вы уверены, что хотите удалить эту книгу?')) {
      return { success: false, message: 'Удаление отменено' };
    }
    
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) {
        debugError('Ошибка удаления:', error);
        throw error;
      }
      
      setBooks(books.filter(book => book.id !== id));
      return { success: true, message: 'Книга успешно удалена!' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      debugError('Ошибка удаления книги:', errorMessage);
      
      return { 
        success: false, 
        message: `Ошибка: ${errorMessage}` 
      };
    }
  };

  // Получение уникальных категорий
  const categories = ['all', ...Array.from(new Set(books.map(b => b.category || 'programming').filter(Boolean) as string[]))];

  // Фильтрация книг
  const filteredBooks = books.filter(book => {
    const matchesSearch = searchTerm === '' || 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || (book.category || 'programming') === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>📚 Админ-панель библиотеки</h1>
        <p>Управление книгами и контентом</p>
        {!storageReady && (
          <div className="warning-banner">
            ⚠️ Для загрузки файлов создайте bucket в Supabase Dashboard:
            <br />
            1. Storage → New bucket
            <br />
            2. Name: <strong>pdf-books</strong>
            <br />
            3. Public: Yes
            <br />
            4. File size limit: 50MB
          </div>
        )}
      </header>

      <div className="admin-content">
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">📖</div>
            <div className="stat-info">
              <h3>Всего книг</h3>
              <p className="stat-number">{books.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✍️</div>
            <div className="stat-info">
              <h3>Авторов</h3>
              <p className="stat-number">
                {Array.from(new Set(books.map(b => b.author))).length}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏷️</div>
            <div className="stat-info">
              <h3>Категорий</h3>
              <p className="stat-number">
                {Array.from(new Set(books.map(b => b.category || 'programming').filter(Boolean))).length}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-info">
              <h3>С PDF</h3>
              <p className="stat-number">
                {books.filter(b => b.pdf_url).length}
              </p>
            </div>
          </div>
        </div>

        <div className="admin-sections">
          <section className="form-section">
            <h2>{editingBook ? '✏️ Редактировать книгу' : '➕ Добавить новую книгу'}</h2>
            {editingBook ? (
              <EditBookForm
                book={editingBook}
                onSubmit={handleUpdateBook}
                onCancel={() => setEditingBook(null)}
                uploadingPDF={uploadingPDF}
              />
            ) : (
              <AddBookForm onSubmit={handleAddBook} uploadingPDF={uploadingPDF} storageReady={storageReady} />
            )}
          </section>

          <section className="list-section">
            <div className="list-header">
              <h2>📋 Список книг ({filteredBooks.length})</h2>
              <div className="list-controls">
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Поиск по названию, автору, тегам..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="clear-search-btn"
                      title="Очистить поиск"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-filter"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'Все категории' : category}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={fetchBooks}
                  className="refresh-btn"
                  disabled={loading}
                >
                  {loading ? '🔄 Загрузка...' : '🔄 Обновить'}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Загрузка книг...</p>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="empty-state">
                <p>📭 Книги не найдены</p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="clear-search-btn"
                  >
                    Очистить поиск
                  </button>
                )}
              </div>
            ) : (
              <BookList
                books={filteredBooks}
                onEdit={setEditingBook}
                onDelete={handleDeleteBook}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}