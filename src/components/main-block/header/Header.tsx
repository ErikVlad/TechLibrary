'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import styles from './Header.module.css';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Обработка клика вне выпадающего меню
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    // Задержка перед закрытием
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 300);
  };

  const handleLogout = async () => {
    try {
      // Сбрасываем состояние
      setDropdownOpen(false);
      
      // Даем небольшую задержку для UX
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Вызываем выход
      await signOut();
      
      // Перенаправляем на главную
      window.location.href = '/';
      
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      // Принудительная перезагрузка
      window.location.href = '/';
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link href="/" className={styles.logo}>
          <i className="fas fa-book-open"></i>
          <span>TechLibrary</span>
        </Link>

        <div className={styles.headerControls}>
          {loading ? (
            <div className={styles.authButtons}>
              <span>Загрузка...</span>
            </div>
          ) : user ? (
            <div 
              className={styles.userMenu}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              ref={dropdownRef}
            >
              <span className={styles.userName}>
                <i className="fas fa-user"></i> 
                {user.user_metadata?.name || user.email?.split('@')[0]}
              </span>
              {dropdownOpen && (
                <div 
                  className={styles.userDropdown}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link href="/account" className={styles.dropdownItem}>
                    <i className="fas fa-user"></i> Мой профиль
                  </Link>
                  <Link href="/admin-panel" className={styles.dropdownItem}>
                    <i className="fas fa-cog"></i> Админ-панель
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className={`${styles.dropdownItem} ${styles.logoutButton}`}
                  >
                    <i className="fas fa-sign-out-alt"></i> Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link href="/login" className={styles.loginBtn}>
                <i className="fas fa-sign-in-alt"></i> Войти
              </Link>
              <Link href="/register" className={styles.registerBtn}>
                <i className="fas fa-user-plus"></i> Регистрация
              </Link>
            </div>
          )}

          <button 
            className={styles.themeToggle} 
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
          >
            <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
          </button>
        </div>
      </div>
    </header>
  );
}
