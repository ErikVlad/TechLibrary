// app/admin-panel/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
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

export default function AdminPanel() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [storageReady, setStorageReady] = useState(false);

  // Проверяем Storage
  useEffect(() => {
    const checkStorage = async () => {
      try {
        debugLog('Проверка Storage...');
        
        const { data, error } = await supabase.storage
          .from('pdf-books')
          .list();
        
        if (error) {
          if (error.message.includes('does not exist')) {
            debugError('Bucket pdf-books не существует');
          } else {
            debugError('Ошибка проверки Storage:', error.message);
          }
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
      debugLog('Загрузка книг...');
      setLoading(true);
      
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        debugError('Ошибка загрузки книг:', error);
        return;
      }
      
      debugLog(`Загружено книг: ${data?.length || 0}`);
      
      const formattedBooks: Book[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title || '',
        author: item.author || '',
        description: item.description || '',
        year: item.year || new Date().getFullYear(),
        pages: item.pages || 0,
        category: item.category || 'programming',
        tags: item.tags || [],
        pdf_url: item.pdf_url || null,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
      
      setBooks(formattedBooks);
    } catch (error) {
      debugError('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Упрощенная загрузка PDF
  const uploadPDF = async (file: File): Promise<string | null> => {
    if (!storageReady) {
      alert('⚠️ Storage не готов. Создайте bucket pdf-books в Supabase Dashboard');
      return null;
    }
    
    try {
      debugLog('Начало загрузки:', file.name);
      setUploadingPDF(true);
      setUploadProgress(0);
      
      // Проверка размера
      if (file.size > 50 * 1024 * 1024) {
        alert('❌ Файл слишком большой. Максимум 50MB');
        return null;
      }
      
      // Проверка типа
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        alert('❌ Файл должен быть PDF');
        return null;
      }
      
      // Имя файла
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      debugLog('Загрузка файла:', fileName);
      
      // Загрузка
      const { error } = await supabase.storage
        .from('pdf-books')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        debugError('Ошибка загрузки:', error);
        alert(`❌ Ошибка загрузки: ${error.message}`);
        return null;
      }
      
      // Получаем URL
      const { data: { publicUrl } } = supabase.storage
        .from('pdf-books')
        .getPublicUrl(fileName);
      
      debugLog('Файл загружен:', publicUrl);
      setUploadProgress(100);
      
      return publicUrl;
    } catch (error) {
      debugError('Неожиданная ошибка:', error);
      alert('❌ Неожиданная ошибка при загрузке');
      return null;
    } finally {
      setTimeout(() => {
        setUploadingPDF(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  // Добавление книги - КРАЙНЕ УПРОЩЕННАЯ ВЕРСИЯ
  const handleAddBook = async (newBook: NewBook, pdfFile?: File) => {
    debugLog('Добавление книги:', newBook.title);
    
    try {
      let pdfUrl = newBook.pdf_url || null;
      
      // Загружаем PDF если есть файл
      if (pdfFile) {
        debugLog('Загрузка PDF файла...');
        const uploadedUrl = await uploadPDF(pdfFile);
        if (uploadedUrl) {
          pdfUrl = uploadedUrl;
        } else {
          return { 
            success: false, 
            message: '❌ Не удалось загрузить PDF' 
          };
        }
      }
      
      // Данные для вставки
      const bookData = {
        title: newBook.title?.trim() || '',
        author: newBook.author?.trim() || '',
        description: newBook.description?.trim() || '',
        year: newBook.year || new Date().getFullYear(),
        pages: newBook.pages || 0,
        category: newBook.category || 'programming',
        tags: newBook.tags || [],
        pdf_url: pdfUrl,
        created_at: new Date().toISOString(),
      };
      
      debugLog('Отправка данных:', bookData);
      
      const { data, error } = await supabase
        .from('books')
        .insert([bookData])
        .select();

      if (error) {
        debugError('Ошибка Supabase:', error);
        
        if (error.code === '23505') {
          return { success: false, message: '❌ Книга с таким названием уже есть' };
        }
        
        return { success: false, message: `❌ Ошибка: ${error.message}` };
      }
      
      if (data?.[0]) {
        const addedBook: Book = {
          id: data[0].id,
          ...bookData,
          updated_at: data[0].updated_at || data[0].created_at,
        };
        
        debugLog('✅ Книга добавлена:', addedBook);
        setBooks(prev => [addedBook, ...prev]);
        
        // Показываем сообщение в консоли
        console.log('✅ Книга успешно добавлена! ID:', addedBook.id);
        
        return { 
          success: true, 
          message: '✅ Книга успешно добавлена!',
          data: addedBook
        };
      }
      
      return { 
        success: false, 
        message: '❌ Книга не была добавлена' 
      };
      
    } catch (error: any) {
      debugError('Ошибка:', error);
      return { 
        success: false, 
        message: `❌ Ошибка: ${error?.message || 'Неизвестная'}` 
      };
    }
  };

  // Обновление книги
  const handleUpdateBook = async (updatedBook: Book, pdfFile?: File) => {
    debugLog('Обновление книги:', updatedBook.id);
    
    try {
      let pdfUrl = updatedBook.pdf_url;
      
      if (pdfFile) {
        const uploadedUrl = await uploadPDF(pdfFile);
        if (uploadedUrl) pdfUrl = uploadedUrl;
      }
      
      const updateData = {
        title: updatedBook.title,
        author: updatedBook.author,
        description: updatedBook.description,
        year: updatedBook.year,
        pages: updatedBook.pages,
        category: updatedBook.category,
        tags: updatedBook.tags,
        pdf_url: pdfUrl,
      };
      
      const { data, error } = await supabase
        .from('books')
        .update(updateData)
        .eq('id', updatedBook.id)
        .select();

      if (error) {
        debugError('Ошибка обновления:', error);
        throw error;
      }
      
      if (data?.[0]) {
        const updated = { ...updatedBook, ...data[0] };
        setBooks(prev => prev.map(b => b.id === updated.id ? updated : b));
        setEditingBook(null);
        return { success: true, message: '✅ Книга обновлена!' };
      }
      
      return { success: false, message: '❌ Книга не обновлена' };
    } catch (error) {
      debugError('Ошибка:', error);
      return { success: false, message: '❌ Ошибка обновления' };
    }
  };

  // Удаление книги
  const handleDeleteBook = async (id: string) => {
    if (!confirm('Удалить книгу?')) {
      return { success: false, message: 'Отменено' };
    }
    
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBooks(prev => prev.filter(b => b.id !== id));
      return { success: true, message: '✅ Книга удалена' };
    } catch (error) {
      debugError('Ошибка удаления:', error);
      return { success: false, message: '❌ Ошибка удаления' };
    }
  };

  // Получение уникальных категорий
  const categories = ['all', ...Array.from(new Set(books.map(b => b.category || 'programming').filter(Boolean)))];

  // Фильтрация книг
  const filteredBooks = books.filter(book => {
    const matchesSearch = !searchTerm || 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (book.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      book.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
        
        {uploadingPDF && (
          <div className="upload-status">
            ⏳ Загрузка PDF файла... {uploadProgress}%
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
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
            <h2>{editingBook ? '✏️ Редактировать книгу' : '➕ Добавить книгу'}</h2>
            {editingBook ? (
              <EditBookForm
                book={editingBook}
                onSubmit={handleUpdateBook}
                onCancel={() => setEditingBook(null)}
                uploadingPDF={uploadingPDF}
              />
            ) : (
              <AddBookForm 
                onSubmit={handleAddBook} 
                uploadingPDF={uploadingPDF} 
                storageReady={storageReady} 
              />
            )}
          </section>

          <section className="list-section">
            <div className="list-header">
              <h2>📋 Список книг ({filteredBooks.length})</h2>
              <div className="list-controls">
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Поиск книг..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="clear-search-btn"
                      title="Очистить"
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
                  {loading ? '🔄' : '🔄'}
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