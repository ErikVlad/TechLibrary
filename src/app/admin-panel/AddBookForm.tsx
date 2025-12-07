'use client';

import { useState } from 'react';
import { NewBook } from '@/lib/types';
import './admin-panel.css';

interface AddBookFormProps {
  onSubmit: (book: NewBook, pdfFile?: File) => Promise<{
    success: boolean;
    message: string;
    data?: any;
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
    pages: 100,
    category: 'programming',
    tags: [],
    pdf_url: '',
  });
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tags' ? value.split(',').map(tag => tag.trim()).filter(Boolean) : 
              name === 'year' || name === 'pages' ? Number(value) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setFormData(prev => ({ ...prev, pdf_url: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.author.trim()) {
      setMessage('❌ Введите название и автора');
      return;
    }
    
    if (!pdfFile && !formData.pdf_url?.trim()) {
      setMessage('❌ Добавьте PDF файл или ссылку');
      return;
    }
    
    if (pdfFile && !storageReady) {
      setMessage('❌ Storage не готов. Создайте bucket pdf-books');
      return;
    }
    
    setLoading(true);
    setMessage('');

    try {
      const result = await onSubmit(formData, pdfFile || undefined);
      
      setMessage(result.message);
      
      if (result.success) {
        // Сброс формы
        setFormData({
          title: '',
          author: '',
          description: '',
          year: new Date().getFullYear(),
          pages: 100,
          category: 'programming',
          tags: [],
          pdf_url: '',
        });
        setPdfFile(null);
        
        // Автоочистка сообщения
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err: any) {
      setMessage(`❌ Ошибка: ${err?.message || 'Неизвестная'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="book-form">
      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="form-group">
        <label>Название *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Название книги"
          required
          disabled={loading || uploadingPDF}
        />
      </div>

      <div className="form-group">
        <label>Автор *</label>
        <input
          type="text"
          name="author"
          value={formData.author}
          onChange={handleInputChange}
          placeholder="Автор"
          required
          disabled={loading || uploadingPDF}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Категория</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            disabled={loading || uploadingPDF}
          >
            <option value="programming">Программирование</option>
            <option value="design">Дизайн</option>
            <option value="business">Бизнес</option>
            <option value="science">Наука</option>
            <option value="fiction">Художественная</option>
            <option value="other">Другое</option>
          </select>
        </div>

        <div className="form-group">
          <label>Год</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            min="1900"
            max={new Date().getFullYear()}
            disabled={loading || uploadingPDF}
          />
        </div>

        <div className="form-group">
          <label>Страниц</label>
          <input
            type="number"
            name="pages"
            value={formData.pages}
            onChange={handleInputChange}
            min="1"
            disabled={loading || uploadingPDF}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Описание</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          placeholder="Описание книги"
          disabled={loading || uploadingPDF}
        />
      </div>

      <div className="form-group">
        <label>Теги (через запятую)</label>
        <input
          type="text"
          name="tags"
          value={formData.tags?.join(', ') || ''}
          onChange={handleInputChange}
          placeholder="javascript, react, programming"
          disabled={loading || uploadingPDF}
        />
      </div>

      <div className="form-group">
        <label>
          PDF файл {!storageReady && '(требуется bucket pdf-books)'}
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={loading || uploadingPDF || !storageReady}
        />
        {pdfFile && (
          <div className="file-info">
            📄 {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
            <button 
              type="button" 
              onClick={() => setPdfFile(null)}
              className="clear-file"
            >
              ✕
            </button>
          </div>
        )}
        {uploadingPDF && <div className="uploading">⏳ Загрузка...</div>}
      </div>

      <div className="form-group">
        <label>Или ссылка на PDF</label>
        <input
          type="url"
          name="pdf_url"
          value={formData.pdf_url || ''}
          onChange={handleInputChange}
          placeholder="https://example.com/book.pdf"
          disabled={loading || uploadingPDF || !!pdfFile}
        />
      </div>

      <div className="form-actions">
        <button 
          type="submit" 
          disabled={loading || uploadingPDF}
          className="submit-btn"
        >
          {loading ? 'Добавление...' : 'Добавить книгу'}
        </button>
        <button 
          type="button" 
          onClick={() => {
            setFormData({
              title: '',
              author: '',
              description: '',
              year: new Date().getFullYear(),
              pages: 100,
              category: 'programming',
              tags: [],
              pdf_url: '',
            });
            setPdfFile(null);
            setMessage('');
          }}
          className="clear-btn"
          disabled={loading || uploadingPDF}
        >
          Очистить
        </button>
      </div>
    </form>
  );
}