// components/main-block/header/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import styles from './Header.module.css';

export default function Header() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Закрываем меню при изменении состояния авторизации
  useEffect(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Логотип */}
        <div className={styles.logo}>
          <Link href="/" className={styles.logoLink}>
            <i className="fas fa-code"></i>
            <span>TechLibrary</span>
          </Link>
        </div>

        {/* Навигация для десктопа */}
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            <i className="fas fa-home"></i> Главная
          </Link>
          <Link href="/literature" className={styles.navLink}>
            <i className="fas fa-book"></i> Библиотека
          </Link>
          <Link href="/favorites" className={styles.navLink}>
            <i className="fas fa-heart"></i> Избранное
          </Link>
          {user && (
            <Link href="/profile" className={styles.navLink}>
              <i className="fas fa-user"></i> Профиль
            </Link>
          )}
        </nav>

        {/* Кнопки авторизации для десктопа */}
        <div className={styles.authButtons}>
          {authLoading ? (
            <div className={styles.authLoading}>
              <i className="fas fa-spinner fa-spin"></i>
            </div>
          ) : user ? (
            <div className={styles.userSection}>
              <div 
                className={styles.userInfo}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setIsDropdownOpen(!isDropdownOpen);
                  }
                }}
              >
                <div className={styles.avatar}>
                  <i className="fas fa-user"></i>
                </div>
                <span className={styles.userName}>
                  {user.email?.split('@')[0] || 'Пользователь'}
                </span>
                <i className={`fas fa-chevron-${isDropdownOpen ? 'up' : 'down'}`}></i>
              </div>
              
              {isDropdownOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownItem}>
                    <i className="fas fa-user"></i>
                    <span>Профиль: {user.email}</span>
                  </div>
                  <div className={styles.dropdownItem}>
                    <i className="fas fa-heart"></i>
                    <Link href="/favorites" className={styles.dropdownLink}>
                      Избранное
                    </Link>
                  </div>
                  <div className={styles.dropdownDivider}></div>
                  <button 
                    className={styles.dropdownItem}
                    onClick={handleSignOut}
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Выйти</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className={styles.authBtn}>
                <i className="fas fa-sign-in-alt"></i> Войти
              </Link>
              <Link href="/register" className={`${styles.authBtn} ${styles.authBtnPrimary}`}>
                <i className="fas fa-user-plus"></i> Регистрация
              </Link>
            </>
          )}
        </div>

        {/* Мобильное меню */}
        <button 
          className={styles.menuToggle}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
        >
          <i className={`fas fa-${isMenuOpen ? 'times' : 'bars'}`}></i>
        </button>
      </div>

      {/* Мобильное меню (выпадающее) */}
      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileNav}>
            <Link 
              href="/" 
              className={styles.mobileNavLink}
              onClick={() => setIsMenuOpen(false)}
            >
              <i className="fas fa-home"></i> Главная
            </Link>
            <Link 
              href="/literature" 
              className={styles.mobileNavLink}
              onClick={() => setIsMenuOpen(false)}
            >
              <i className="fas fa-book"></i> Библиотека
            </Link>
            <Link 
              href="/favorites" 
              className={styles.mobileNavLink}
              onClick={() => setIsMenuOpen(false)}
            >
              <i className="fas fa-heart"></i> Избранное
            </Link>
            {user && (
              <Link 
                href="/profile" 
                className={styles.mobileNavLink}
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-user"></i> Профиль
              </Link>
            )}
          </div>
          
          <div className={styles.mobileAuth}>
            {authLoading ? (
              <div className={styles.mobileAuthLoading}>
                <i className="fas fa-spinner fa-spin"></i> Загрузка...
              </div>
            ) : user ? (
              <>
                <div className={styles.mobileUserInfo}>
                  <i className="fas fa-user"></i>
                  <span>{user.email}</span>
                </div>
                <button 
                  className={styles.mobileAuthBtn}
                  onClick={handleSignOut}
                >
                  <i className="fas fa-sign-out-alt"></i> Выйти
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className={styles.mobileAuthBtn}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-sign-in-alt"></i> Войти
                </Link>
                <Link 
                  href="/register" 
                  className={`${styles.mobileAuthBtn} ${styles.mobileAuthBtnPrimary}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-user-plus"></i> Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
