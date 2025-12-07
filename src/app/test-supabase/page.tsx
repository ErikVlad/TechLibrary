'use client';

import { useState } from 'react';

interface TestResult {
  success: boolean;
  message: string;
  tests?: {
    databaseConnection: boolean;
    authentication: boolean;
    tableAccess: boolean;
    booksCount: number;
  };
  errors?: Record<string, string>;
  troubleshooting?: string[];
  details?: {
    booksInDatabase: number;
    hasActiveSession: boolean;
    canReadBooks: boolean;
  };
  nextSteps?: string[];
}

export default function TestSupabasePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-supabase');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: TestResult = await response.json();
      setResult(data);
      
      if (!data.success) {
        setError(data.message);
      }
    } catch (err) {
      const error = err as Error;
      setError(`Не удалось выполнить запрос: ${error.message}`);
      console.error('Test connection error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Тест подключения к Supabase</h1>
      
      <button 
        onClick={testConnection}
        disabled={loading}
        style={{
          padding: '1rem 2rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem',
          marginBottom: '2rem'
        }}
      >
        {loading ? 'Тестируем...' : 'Протестировать подключение'}
      </button>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          color: '#dc2626'
        }}>
          <h3>❌ Ошибка:</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div>
          <h2 style={{ color: result.success ? '#10b981' : '#ef4444' }}>
            {result.success ? '✅ Успешно!' : '❌ Провал'}
          </h2>
          <p>{result.message}</p>

          {result.tests && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3>Результаты тестов:</h3>
              <ul>
                <li>📊 Подключение к БД: {result.tests.databaseConnection ? '✅' : '❌'}</li>
                <li>🔐 Аутентификация: {result.tests.authentication ? '✅' : '❌'}</li>
                <li>📖 Доступ к таблице books: {result.tests.tableAccess ? '✅' : '❌'}</li>
                <li>📚 Книг в базе: {result.tests.booksCount}</li>
              </ul>
            </div>
          )}

          {result.details && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3>Детали:</h3>
              <pre style={{
                backgroundColor: '#f3f4f6',
                padding: '1rem',
                borderRadius: '8px',
                overflow: 'auto'
              }}>
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </div>
          )}

          {result.errors && Object.keys(result.errors).length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3>Ошибки:</h3>
              <pre style={{
                backgroundColor: '#fef2f2',
                padding: '1rem',
                borderRadius: '8px',
                overflow: 'auto',
                color: '#dc2626'
              }}>
                {JSON.stringify(result.errors, null, 2)}
              </pre>
            </div>
          )}

          {result.troubleshooting && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3>Рекомендации по устранению проблем:</h3>
              <ul>
                {result.troubleshooting.map((item: string, index: number) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h3>Что проверять если не работает:</h3>
        <ol>
          <li>
            <strong>Ключи в client.ts</strong>
            <pre style={{ fontSize: '0.8rem', margin: '0.5rem 0' }}>
{`supabaseUrl: 'https://vhrpcwukwyjtuikpoefz.supabase.co'
supabaseAnonKey: 'ваш_ключ_здесь'`}
            </pre>
          </li>
          <li>
            <strong>RLS политики в Supabase:</strong>
            <p>Зайдите в Supabase Dashboard → Authentication → Policies</p>
          </li>
          <li>
            <strong>Таблица books:</strong>
            <p>Убедитесь что таблица существует: Table Editor → books</p>
          </li>
          <li>
            <strong>Проверьте консоль браузера (F12):</strong>
            <p>Посмотрите нет ли CORS ошибок</p>
          </li>
        </ol>
      </div>
    </div>
  );
}