// components/books/PDFViewer/PDFViewer.tsx
'use client';

import './PDFViewer.module.css';

interface PDFViewerProps {
  pdfUrl: string;
}

export default function PDFViewer({ pdfUrl }: PDFViewerProps) {
  return (
    <div className="pdf-viewer">
      <div className="pdf-controls">
        <a 
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pdf-download-btn"
        >
          ⬇️ Скачать PDF
        </a>
        <a 
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pdf-open-btn"
        >
          🔗 Открыть в новой вкладке
        </a>
      </div>
      
      <div className="pdf-container">
        <iframe 
          src={pdfUrl} 
          className="pdf-frame"
          title="PDF просмотр"
        />
      </div>
    </div>
  );
}