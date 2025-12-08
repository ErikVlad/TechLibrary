'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import styles from './auth.module.css';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // Добавлено поле для имени
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        router.push('/');
      } else {
        // При регистрации передаем имя пользователя
        if (!fullName.trim()) {
          throw new Error('Введите ваше имя');
        }
        
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        
        // После регистрации показываем сообщение
        alert('Регистрация успешна! Проверьте вашу почту для подтверждения.');
        setIsLogin(true);
        setFullName('');
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <h1 className={styles.authTitle}>
          {isLogin ? 'Вход в аккаунт' : 'Создание аккаунта'}
        </h1>
        
        <form onSubmit={handleSubmit} className={styles.authForm}>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label htmlFor="fullName" className={styles.label}>
                <i className="fas fa-user"></i> Ваше имя
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={styles.input}
                placeholder="Иван Иванов"
                required={!isLogin}
              />
              <p className={styles.helpText}>
                Это имя будет отображаться в правом верхнем углу
              </p>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              <i className="fas fa-envelope"></i> Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="example@mail.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              <i className="fas fa-lock"></i> Пароль
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Минимум 6 символов"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Обработка...
              </>
            ) : (
              <>
                <i className={isLogin ? 'fas fa-sign-in-alt' : 'fas fa-user-plus'}></i>
                {isLogin ? 'Войти' : 'Зарегистрироваться'}
              </>
            )}
          </button>
        </form>

        <div className={styles.authSwitch}>
          <p>
            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
            <button 
              type="button" 
              className={styles.switchButton}
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? ' Зарегистрироваться' : ' Войти'}
            </button>
          </p>
        </div>

        <div className={styles.authLinks}>
          <Link href="/" className={styles.homeLink}>
            <i className="fas fa-home"></i> Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
