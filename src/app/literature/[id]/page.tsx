// src/app/literature/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Book } from '@/lib/types';

export default function BookDetailPage() {
  const params = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBook() {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('id', params.id)
          .single();
        
        if (error) throw error;
        setBook(data);
      } catch (error) {
        console.error('Error fetching book:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchBook();
  }, [params.id]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f7fa'
      }}>
        <div style={{ fontSize: '20px', color: '#666' }}>Загрузка книги...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f7fa'
      }}>
        <h1 style={{ fontSize: '28px', color: '#333', marginBottom: '20px' }}>
          Книга не найдена
        </h1>
        <Link 
          href="/literature" 
          style={{
            padding: '12px 24px',
            background: '#4a90e2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px'
          }}
        >
          Вернуться в библиотеку
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f7fa',
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Хлебные крошки */}
      <nav style={{ marginBottom: '30px', fontSize: '14px', color: '#666' }}>
        <Link href="/" style={{ color: '#4a90e2', textDecoration: 'none' }}>
          Главная
        </Link> → 
        <Link href="/literature" style={{ color: '#4a90e2', textDecoration: 'none' }}>
          Библиотека
        </Link> → 
        <span> {book.title}</span>
      </nav>

      {/* Карточка книги */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#333',
            marginBottom: '10px'
          }}>
            {book.title}
          </h1>
          <p style={{ fontSize: '20px', color: '#666', marginBottom: '20px' }}>
            Автор: {book.author}
          </p>
          
          {book.description && (
            <p style={{
              color: '#555',
              lineHeight: '1.6',
              marginBottom: '25px',
              fontSize: '16px',
              maxWidth: '800px',
              margin: '0 auto 25px'
            }}>
              {book.description}
            </p>
          )}
        </div>

        {/* Мета-информация */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          {book.category && (
            <div style={{
              background: '#f8f9fa',
              padding: '12px 20px',
              borderRadius: '8px',
              minWidth: '120px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#888',
                marginBottom: '4px',
                textTransform: 'uppercase'
              }}>
                Категория
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#333'
              }}>
                {book.category}
              </div>
            </div>
          )}
          
          <div style={{
            background: '#f8f9fa',
            padding: '12px 20px',
            borderRadius: '8px',
            minWidth: '120px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#888',
              marginBottom: '4px',
              textTransform: 'uppercase'
            }}>
              Страниц
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#333'
            }}>
              {book.pages}
            </div>
          </div>
          
          <div style={{
            background: '#f8f9fa',
            padding: '12px 20px',
            borderRadius: '8px',
            minWidth: '120px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#888',
              marginBottom: '4px',
              textTransform: 'uppercase'
            }}>
              Год
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#333'
            }}>
              {book.year}
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          {book.pdf_url ? (
            <>
              <a
                href={book.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '12px 24px',
                  background: '#4a90e2',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                📖 Читать онлайн
              </a>
              
              <a
                href={book.pdf_url}
                download
                style={{
                  padding: '12px 24px',
                  background: '#34c759',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ⬇️ Скачать PDF
              </a>
            </>
          ) : (
            <button
              disabled
              style={{
                padding: '12px 24px',
                background: '#e0e0e0',
                color: '#999',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'not-allowed'
              }}
            >
              PDF недоступен
            </button>
          )}
          
          <button style={{
            padding: '12px 24px',
            background: '#ff2d55',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ❤️ В избранное
          </button>
        </div>
      </div>

      {/* PDF просмотр */}
      {book.pdf_url && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            📄 Чтение PDF
          </h3>
          
          <div style={{
            width: '100%',
            height: '600px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <iframe 
              src={book.pdf_url} 
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title="PDF просмотр"
            />
          </div>
          
          <div style={{
            marginTop: '15px',
            textAlign: 'center'
          }}>
            <a 
              href={book.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#4a90e2',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Открыть PDF в новой вкладке →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}