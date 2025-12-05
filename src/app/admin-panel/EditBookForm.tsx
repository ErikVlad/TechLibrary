'use client';

import { useState, useEffect } from 'react';
import { Book } from '@/lib/types';
import './admin-panel.css';

interface EditBookFormProps {
  book: Book;
  onSubmit: (book: Book, pdfFile?: File) => Promise<{
    success: boolean;
    message: string;
  }>;
  onCancel: () => void;
  uploadingPDF: boolean;
}

export default function EditBookForm({ book, onSubmit, onCancel, uploadingPDF }: EditBookFormProps) {
  const [formData, setFormData] = useState<Book>(book);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);


  useEffect(() => {
    console.log('EditBookForm: Инициализация формы для книги:', book.title);
    
    const safeBook: Book = {
      ...book,
      category: book.category || 'programming',
      tags: book.tags || [],
      description: book.description || '',
      pdf_url: book.pdf_url || null,
      cover_url: book.cover_url || null,
      year: isNaN(book.year) ? new Date().getFullYear() : book.year,
      pages: isNaN(book.pages) ? 0 : book.pages,
    };
    
    setFormData(safeBook);
  }, [book]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    console.log(`EditBookForm: Изменено поле ${name}:`, value);
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tags' ? value.split(',').map(tag => tag.trim()) : 
              name === 'year' || name === 'pages' ? parseInt(value) || 0 : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(`EditBookForm: Выбран ${type} файл:`, file.name);
      
      if (type === 'pdf') {
        setPdfFile(file);
      } else {
        setCoverFile(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('EditBookForm: Начало отправки формы', {
      bookId: formData.id,
      title: formData.title
    });
    
    if (!formData.title || !formData.author) {
      setMessage({ 
        type: 'error', 
        text: 'Заполните обязательные поля: название и автор' 
      });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    try {
      // Подготавливаем данные для отправки
      const bookDataToSend: Book = {
        id: formData.id,
        title: formData.title,
        author: formData.author,
        description: formData.description || '',
        year: isNaN(formData.year) ? new Date().getFullYear() : formData.year,
        pages: isNaN(formData.pages) ? 0 : formData.pages,
        category: formData.category || 'programming',
        tags: formData.tags || [],
        pdf_url: formData.pdf_url || null,
        cover_url: formData.cover_url || null,
        created_at: formData.created_at || new Date().toISOString(),
        updated_at: formData.updated_at,
      };
      
      console.log('EditBookForm: Отправка данных:', bookDataToSend);
      
      const result = await onSubmit(bookDataToSend, pdfFile || undefined);
      
      console.log('EditBookForm: Результат:', result);
      
      setMessage({ 
        type: result.success ? 'success' : 'error', 
        text: result.message 
      });
      
      // Если успешно, очищаем файлы
      if (result.success) {
        setPdfFile(null);
        setCoverFile(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('EditBookForm: Ошибка:', err);
      
      setMessage({ 
        type: 'error', 
        text: `Произошла ошибка: ${errorMessage}` 
      });
    } finally {
      setLoading(false);
      console.log('EditBookForm: Форма отправлена');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="book-form">
      <div className="form-info">
        <p>Редактирование книги: <strong>{book.title}</strong></p>
        <p className="book-id">ID: {book.id}</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="title">Название книги *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Введите название книги"
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">Автор *</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            required
            placeholder="Введите имя автора"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Категория</label>
          <select
            id="category"
            name="category"
            value={formData.category || 'programming'}
            onChange={handleInputChange}
          >
            <option value="programming">Программирование</option>
            <option value="design">Дизайн</option>
            <option value="business">Бизнес</option>
            <option value="science">Наука</option>
            <option value="fiction">Художественная литература</option>
            <option value="other">Другое</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="year">Год издания</label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            min="1900"
            max={new Date().getFullYear()}
            placeholder="2024"
          />
        </div>

        <div className="form-group">
          <label htmlFor="pages">Количество страниц</label>
          <input
            type="number"
            id="pages"
            name="pages"
            value={formData.pages}
            onChange={handleInputChange}
            min="0"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Теги (через запятую)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags?.join(', ') || ''}
            onChange={handleInputChange}
            placeholder="javascript, react, programming"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            rows={4}
            placeholder="Введите описание книги..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="pdf">Новый PDF файл книги</label>
          <input
            type="file"
            id="pdf"
            accept=".pdf"
            onChange={(e) => handleFileChange(e, 'pdf')}
            disabled={uploadingPDF}
          />
          {pdfFile ? (
            <div className="file-info">
              <span>📄 {pdfFile.name} (новый)</span>
              <span className="file-size">
                ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          ) : formData.pdf_url ? (
            <div className="file-info">
              <span>📄 Текущий PDF</span>
              <a href={formData.pdf_url} target="_blank" rel="noopener noreferrer" className="view-link">
                👁️ Просмотреть
              </a>
            </div>
          ) : null}
          {uploadingPDF && <p className="uploading-text">Загрузка PDF...</p>}
        </div>

        {/* ИСПРАВЛЕННАЯ СТРОКА: Заменен style="display: none;" на style={{ display: 'none' }} */}
        <div className="form-group" style={{ display: 'none' }}>
          <label htmlFor="cover">Новая обложка (локально)</label>
          <input
            type="file"
            id="cover"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'cover')}
          />
          {coverFile && (
            <div className="file-info">
              <span>🖼️ {coverFile.name} (новая, локально)</span>
            </div>
          )}
        </div>

        <div className="form-group full-width">
          <label htmlFor="pdf_url">Ссылка на PDF (URL)</label>
          <input
            type="url"
            id="pdf_url"
            name="pdf_url"
            value={formData.pdf_url || ''}
            onChange={handleInputChange}
            placeholder="https://example.com/book.pdf"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="cover_url">Ссылка на обложку (URL)</label>
          <input
            type="url"
            id="cover_url"
            name="cover_url"
            value={formData.cover_url || ''}
            onChange={handleInputChange}
            placeholder="https://example.com/cover.jpg"
          />
        </div>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      <div className="form-actions">
        <button 
          type="submit" 
          disabled={loading || uploadingPDF}
          className="submit-btn"
        >
          {loading ? '⏳ Сохранение...' : '💾 Сохранить изменения'}
        </button>
        
        <button 
          type="button" 
          onClick={() => {
            console.log('EditBookForm: Отмена редактирования');
            onCancel();
          }}
          className="cancel-btn"
          disabled={loading}
        >
          Отмена
        </button>
      </div>
    </form>
  );
}