// components/main-block/header/HeaderNoAuth.tsx
'use client';

import Link from 'next/link';
import styles from './Header.module.css';

export default function HeaderNoAuth() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/" className={styles.logoLink}>
            <i className="fas fa-code"></i>
            <span>TechLibrary</span>
          </Link>
        </div>
        
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            <i className="fas fa-home"></i> Главная
          </Link>
          <Link href="/literature" className={styles.navLink}>
            <i className="fas fa-book"></i> Библиотека
          </Link>
        </nav>
        
        <div className={styles.authButtons}>
          <span style={{ color: '#666' }}>Авторизация отключена для отладки</span>
        </div>
      </div>
    </header>
  );
}
