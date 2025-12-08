import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import Header from '@/components/main-block/header/Header';
import Footer from '@/components/main-block/footer/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'TechLibrary • Бесплатная библиотека программиста',
  description: 'Бесплатная библиотека технической литературы для разработчиков',
  keywords: 'программирование, книги, техническая литература, IT, разработка',
  authors: [{ name: 'TechLibrary' }],
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light dark" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Font Awesome */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
        
        {/* Preconnect для внешних ресурсов */}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        <link rel="preconnect" href="https://vhrpcwukwyjtuikpoefz.supabase.co" />
        
        {/* Предотвращение дублирования предзагрузки шрифтов */}
        <link 
          rel="preload" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/webfonts/fa-solid-900.woff2" 
          as="font" 
          type="font/woff2" 
          crossOrigin="anonymous" 
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <div className="app-container min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
        
        {/* Скрипт для предотвращения Chrome кэширования */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (navigator.userAgent.indexOf('Chrome') !== -1) {
                window.addEventListener('pageshow', function(event) {
                  if (event.persisted) {
                    window.location.reload();
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
