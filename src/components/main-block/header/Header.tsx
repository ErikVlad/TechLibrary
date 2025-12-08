'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import styles from './Header.module.css';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Загружаем имя пользователя из профиля
  useEffect(() => {
    const loadUserName = async () => {
      if (user) {
        try {
          // Пробуем получить имя из профиля в таблице profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', user.id)
            .single();
          
          // Получаем имя в порядке приоритета:
          // 1. full_name из профиля
          // 2. username из профиля  
          // 3. name из user_metadata
          // 4. email (без домена)
          const name = 
            profile?.full_name || 
            profile?.username || 
            user.user_metadata?.full_name ||
            user.user_metadata?.name || 
            user.email?.split('@')[0] || 
            'Пользователь';
          
          setUserName(name);
        } catch (error) {
          console.error('Ошибка загрузки имени:', error);
          // Если ошибка, используем данные из метаданных
          const fallbackName = 
            user.user_metadata?.full_name ||
            user.user_metadata?.name || 
            user.email?.split('@')[0] || 
            'Пользователь';
          setUserName(fallbackName);
        }
      } else {
        setUserName('');
      }
    };

    loadUserName();
  }, [user]);

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
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 300);
  };

  const handleLogout = async () => {
    try {
      setDropdownOpen(false);
      await new Promise(resolve => setTimeout(resolve, 100));
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Ошибка при выходе:', error);
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
                {userName}
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
