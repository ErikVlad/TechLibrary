import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>TechLibrary</h3>
          <p>
            Бесплатная библиотека технической литературы для разработчиков
          </p>
        </div>

        <div className={styles.footerSection}>
          <h3>Категории</h3>
          <ul className={styles.footerLinks}>
            <li><a href="#">Программирование</a></li>
            <li><a href="#">Базы данных</a></li>
            <li><a href="#">Веб-разработка</a></li>
            <li><a href="#">Мобильная разработка</a></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3>Разделы</h3>
          <ul className={styles.footerLinks}>
            <li><a href="#">Новинки</a></li>
            <li><a href="#">Популярное</a></li>
            <li><a href="#">Рекомендации</a></li>
            <li><a href="#">Авторы</a></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3>Контакты</h3>
          <ul className={styles.footerLinks}>
            <li><a href="#"><i className="fas fa-envelope"></i> support@techlibrary.dev</a></li>
            <li><a href="#"><i className="fab fa-github"></i> GitHub</a></li>
            <li><a href="#"><i className="fab fa-telegram"></i> Telegram</a></li>
          </ul>
        </div>
      </div>

      <div className={styles.copyright}>
        © 2025 TechLibrary. Все книги предоставляются бесплатно для образовательных целей.
      </div>
    </footer>
  );
}