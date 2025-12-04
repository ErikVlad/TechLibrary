// src/app/admin-panel/BookList.tsx
'use client';

import { Book } from '@/lib/types';
import Image from 'next/image'; // ← ДОБАВЬТЕ ЭТО

interface BookListProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onDelete: (id: string) => Promise<{ success: boolean; message: string }>;
}

export default function BookList({ books, onEdit, onDelete }: BookListProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <div className="book-list">
      <div className="table-container">
        <table className="books-table">
          <thead>
            <tr>
              <th>Обложка</th>
              <th>Название</th>
              <th>Автор</th>
              <th>Год</th>
              <th>Категория</th>
              <th>PDF</th>
              <th>Дата добавления</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.id}>
                <td>
                  {book.cover_url ? (
                    <div className="book-cover-container">
                      <Image 
                        src={book.cover_url} 
                        alt={book.title}
                        width={40}
                        height={50}
                        className="book-cover"
                      />
                    </div>
                  ) : (
                    <div className="cover-placeholder">📚</div>
                  )}
                </td>
                <td>
                  <div className="book-title-cell">
                    <strong>{book.title}</strong>
                    <div className="book-pages">{book.pages} стр.</div>
                  </div>
                </td>
                <td>{book.author}</td>
                <td>{book.year}</td>
                <td>
                  <span className="category-badge">{book.category || '—'}</span>
                </td>
                <td>
                  {book.pdf_url ? (
                    <a 
                      href={book.pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="pdf-link"
                      title="Открыть PDF"
                    >
                      📄
                    </a>
                  ) : (
                    <span className="no-pdf">—</span>
                  )}
                </td>
                <td>{formatDate(book.created_at)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => onEdit(book)}
                      className="edit-btn"
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(book.id)}
                      className="delete-btn"
                      title="Удалить"
                    >
                      🗑️
                    </button>
                    <a
                      href={`/literature/${book.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-btn"
                      title="Просмотреть на сайте"
                    >
                      👁️
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {books.length > 10 && (
        <div className="table-footer">
          <div className="pagination-info">
            Показано {books.length} книг
          </div>
        </div>
      )}
    </div>
  );
}