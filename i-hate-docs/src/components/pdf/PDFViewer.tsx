import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string;
  zoom: number;
}

export function PDFViewer({ url, zoom }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load PDF
  useEffect(() => {
    setLoading(true);
    setError(null);
    setPdfDoc(null);

    pdfjsLib
      .getDocument({ url, cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`, cMapPacked: true })
      .promise
      .then((doc) => {
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setPage(1);
        setLoading(false);
      })
      .catch((err) => {
        console.error('PDF load error:', err);
        setError('Failed to load PDF. The file may be corrupted or inaccessible.');
        setLoading(false);
      });

    return () => {
      pdfDoc?.destroy();
    };
  }, [url]);

  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    pdfDoc.getPage(page).then((pdfPage) => {
      const viewport = pdfPage.getViewport({ scale: 1 });
      const scale = zoom / 100;
      const scaledViewport = pdfPage.getViewport({ scale });

      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;

      pdfPage.render({
        canvas,
        viewport: scaledViewport,
      });
    });
  }, [pdfDoc, page, zoom]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-[612px] h-[792px] bg-white rounded-sm shadow-xl">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-xl bg-accent animate-pulse" />
          <p className="text-sm text-gray-400">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-[612px] h-[792px] bg-white rounded-sm shadow-xl">
        <div className="text-center space-y-3 max-w-sm">
          <p className="text-sm text-rose-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="rounded-sm shadow-xl bg-white"
      />
      {/* Page Navigation */}
      {totalPages > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 glass-panel-strong border border-border-strong rounded-full px-3 py-1.5 text-xs font-medium text-text-secondary">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-1 hover:text-text-primary disabled:opacity-30 transition-colors"
          >
            ‹ Prev
          </button>
          <span className="tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-1 hover:text-text-primary disabled:opacity-30 transition-colors"
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}
