import { ReactNode } from 'react';
import styles from './Sidebar.module.css';

interface SidebarLayoutProps {
  children: ReactNode;
  filters: ReactNode;
}

export default function SidebarLayout({ children, filters }: SidebarLayoutProps) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        {filters}
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}