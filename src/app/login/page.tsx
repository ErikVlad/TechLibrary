'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { AuthError } from '@supabase/supabase-js';
import styles from './auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>Вход в TechLibrary</h1>
          <p>Войдите в свой аккаунт для доступа к библиотеке</p>
        </div>
        
        {error && (
          <div className={styles.errorMessage}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Вход...
              </>
            ) : (
              'Войти'
            )}
          </button>
        </form>
        
        <div className={styles.authFooter}>
          <p>
            Нет аккаунта?{' '}
            <Link href="/register" className={styles.link}>
              Зарегистрируйтесь
            </Link>
          </p>
          <Link href="/forgot-password" className={styles.link}>
            Забыли пароль?
          </Link>
        </div>
        
        <div className={styles.demoNote}>
          <p><strong>Тестовый аккаунт:</strong>email: 2@2 / password: 123456</p>
        </div>
      </div>
    </div>
  );
}
