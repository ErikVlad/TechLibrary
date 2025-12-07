'use client';

import styles from './PDFViewer.module.css';

interface PDFViewerProps {
  pdfUrl: string;
}

export default function PDFViewer({ pdfUrl }: PDFViewerProps) {
  if (!pdfUrl) {
    return (
      <div className={styles.pdfViewer}>
        <div className={styles.pdfError}>
          <p>PDF файл не найден</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pdfViewer}>
      <div className={styles.pdfControls}>
        <a 
          href={pdfUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className={styles.pdfDownloadBtn}
        >
          ⬇️ Скачать PDF
        </a>
        <a 
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.pdfOpenBtn}
        >
          🔗 Открыть в новой вкладке
        </a>
      </div>
      
      <div className={styles.pdfContainer}>
        <iframe 
          src={pdfUrl} 
          className={styles.pdfFrame}
          title="PDF просмотр"
        />
      </div>
    </div>
  );
}
