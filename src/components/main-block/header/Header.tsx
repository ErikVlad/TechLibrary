'use client';

import Link from 'next/link';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import styles from './Header.module.css';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut, loading } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link href="/" className={styles.logo}>
          <i className="fas fa-book-open"></i>
          <span>TechLibrary</span>
        </Link>

        <div className={styles.headerControls}>
          {/* Кнопки авторизации */}
          {loading ? (
            <div className={styles.authButtons}>
              <span>Загрузка...</span>
            </div>
          ) : user ? (
            <div className={styles.userMenu}>
              <span className={styles.userName}>
                <i className="fas fa-user"></i> 
                {user.user_metadata?.name || user.email?.split('@')[0]}
              </span>
              <div className={styles.userDropdown}>
                <Link href="/account" className={styles.dropdownItem}>
                  <i className="fas fa-user"></i> Мой профиль
                </Link>
                <Link href="/admin-panel" className={styles.dropdownItem}>
                  <i className="fas fa-cog"></i> Админ-панель
                </Link>
                <button onClick={() => signOut()} className={styles.dropdownItem}>
                  <i className="fas fa-sign-out-alt"></i> Выйти
                </button>
              </div>
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

          <button className={styles.themeToggle} onClick={toggleTheme}>
            <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
          </button>
        </div>
      </div>
    </header>
  );
}