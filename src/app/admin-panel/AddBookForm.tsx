// src/app/admin-panel/AddBookForm.tsx
'use client';

import { useState } from 'react';
import { NewBook } from '@/lib/types';
import './admin-panel.css';

interface AddBookFormProps {
  onSubmit: (book: NewBook, pdfFile?: File) => Promise<{
    success: boolean;
    message: string;
  }>;
  uploadingPDF: boolean;
  storageReady?: boolean;
}

export default function AddBookForm({ onSubmit, uploadingPDF, storageReady = true }: AddBookFormProps) {
  const [formData, setFormData] = useState<NewBook>({
    title: '',
    author: '',
    description: '',
    year: new Date().getFullYear(),
    pages: 0,
    category: 'programming',
    tags: [],
    pdf_url: '',
    // Убрали cover_url из начального состояния
  });
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tags' ? value.split(',').map(tag => tag.trim()) : 
              name === 'year' || name === 'pages' ? parseInt(value) || 0 : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'pdf') {
        setPdfFile(file);
      } else {
        setCoverFile(file);
        // Только локальное сохранение
        const reader = new FileReader();
        reader.onload = () => {
          console.log('Обложка сохранена локально');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      // Создаем копию для отправки - БЕЗ cover_url
      const bookToSubmit: NewBook = {
        title: formData.title,
        author: formData.author,
        description: formData.description || '',
        year: formData.year,
        pages: formData.pages,
        category: formData.category || 'programming',
        tags: formData.tags || [],
        pdf_url: formData.pdf_url || null,
        // Не отправляем cover_url
      };
      
      const result = await onSubmit(bookToSubmit, pdfFile || undefined);
      
      setMessage({ 
        type: result.success ? 'success' : 'error', 
        text: result.message 
      });
      
      if (result.success) {
        // Сброс формы
        setFormData({
          title: '',
          author: '',
          description: '',
          year: new Date().getFullYear(),
          pages: 0,
          category: 'programming',
          tags: [],
          pdf_url: '',
        });
        setPdfFile(null);
        setCoverFile(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setMessage({ 
        type: 'error', 
        text: `Произошла ошибка: ${errorMessage}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="book-form">
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
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Введите описание книги..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="pdf">
            PDF файл книги 
            {!storageReady && <span className="warning-text"> (Создайте bucket pdf-books)</span>}
          </label>
          <input
            type="file"
            id="pdf"
            accept=".pdf"
            onChange={(e) => handleFileChange(e, 'pdf')}
            disabled={uploadingPDF || !storageReady}
          />
          {pdfFile && (
            <div className="file-info">
              <span>📄 {pdfFile.name}</span>
              <span className="file-size">
                ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}
          {uploadingPDF && <p className="uploading-text">Загрузка PDF...</p>}
          {!storageReady && (
            <p className="warning-text">
              ⚠️ Создайте bucket <strong>pdf-books</strong> в Supabase Dashboard для загрузки файлов
            </p>
          )}
        </div>

        <div className="form-group" style={{ display: 'none' }}>
          <label htmlFor="cover">Обложка (только локально)</label>
          <input
            type="file"
            id="cover"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'cover')}
          />
          {coverFile && (
            <div className="file-info">
              <span>🖼️ {coverFile.name} (сохранена локально)</span>
            </div>
          )}
        </div>

        <div className="form-group full-width">
          <label htmlFor="pdf_url">Ссылка на PDF (URL, альтернатива файлу)</label>
          <input
            type="url"
            id="pdf_url"
            name="pdf_url"
            value={formData.pdf_url || ''}
            onChange={handleInputChange}
            placeholder="https://example.com/book.pdf"
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
          {loading ? '⏳ Добавление...' : '➕ Добавить книгу'}
        </button>
      </div>
    </form>
  );
}