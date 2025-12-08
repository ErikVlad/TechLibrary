'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import styles from './auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Пароли не совпадают!');
      return;
    }
    
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    if (!name.trim()) {
      setError('Введите ваше имя');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Используем signUp из AuthProvider (просто передаем name как третий аргумент)
      const { data, error } = await signUp(email, password, name);
      
      if (error) {
        setError(error.message);
      } else if (data?.user) {
        setSuccess('Регистрация успешна! Проверьте вашу почту для подтверждения аккаунта.');
        
        // Очищаем форму
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        // Перенаправляем на логин через 3 секунды
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>Регистрация в TechLibrary</h1>
          <p>Создайте аккаунт для доступа к библиотеке</p>
        </div>
        
        {error && (
          <div className={styles.errorMessage}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}
        
        {success && (
          <div className={styles.successMessage}>
            <i className="fas fa-check-circle"></i> {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Имя</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              required
              disabled={loading}
            />
            <p className={styles.helpText}>Это имя будет отображаться в правом верхнем углу и в приветствиях</p>
          </div>
          
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
              placeholder="Минимум 6 символов"
              required
              disabled={loading}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Подтвердите пароль</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите пароль"
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={loading || !!success}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Регистрация...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i> Зарегистрироваться
              </>
            )}
          </button>
        </form>
        
        <div className={styles.authFooter}>
          <p>
            Уже есть аккаунт?{' '}
            <Link href="/login" className={styles.link}>
              Войдите
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
