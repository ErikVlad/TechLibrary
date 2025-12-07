// components/main-block/sidebar/SimpleLayout.tsx
'use client';

interface SimpleLayoutProps {
  children: React.ReactNode;
  filters?: React.ReactNode;
}

export default function SimpleLayout({ children, filters }: SimpleLayoutProps) {
  console.log('🔧 SimpleLayout: Рендер');
  
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Сайдбар с фильтрами */}
      <div style={{
        width: '300px',
        padding: '20px',
        backgroundColor: 'white',
        borderRight: '1px solid #ddd'
      }}>
        {filters || <div>Фильтры</div>}
      </div>
      
      {/* Основной контент */}
      <div style={{
        flex: 1,
        padding: '20px'
      }}>
        {children}
      </div>
    </div>
  );
}
