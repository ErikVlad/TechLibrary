import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import HeaderNoAuth from '@/components/main-block/header/HeaderNoAuth'; // Используем заглушку
import Footer from '@/components/main-block/footer/Footer';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'TechLibrary • Бесплатная библиотека программиста',
  description: 'Бесплатная библиотека технической литературы для разработчиков',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          {/* Временно отключен весь Auth */}
          <HeaderNoAuth />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
