"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, Loader2, FileText } from "lucide-react";

// Configure PDF.js worker from CDN (version-matched to installed pdfjs-dist)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  file: string;
}

export default function PdfViewer({ file }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // PDF.js options: CMap for CJK fonts, standard fonts for correct rendering
  const documentOptions = useMemo(
    () => ({
      cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    }),
    []
  );

  // Measure container width for responsive page rendering
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Reset state when file changes (navigating to a different document)
  useEffect(() => {
    setPageNumber(1);
    setLoadError(null);
  }, [file]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoadError(null);
  }, []);

  const onDocumentLoadError = useCallback((err: Error) => {
    setLoadError(err.message || "Failed to load PDF");
  }, []);

  // Calculate page width: fit container width, cap at 800px for readability
  const pageWidth = containerWidth > 0 ? Math.min(containerWidth, 800) : undefined;

  const goToPrevPage = () => setPageNumber((prev) => Math.max(1, prev - 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(numPages, prev + 1));

  // Empty file guard
  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <FileText className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-sm">Preview not available</p>
        <p className="text-xs mt-1">Please download the file to view it</p>
      </div>
    );
  }

  // Error state: show download fallback
  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground px-4">
        <FileText className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-sm mb-1">Unable to load PDF preview</p>
        <p className="text-xs mb-4 opacity-70 break-all">{loadError}</p>
        <a href={file} download>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download to view
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full py-4">
      {/* PDF Document */}
      <Document
        key={file}
        file={file}
        options={documentOptions}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-3" />
            <p className="text-sm">Loading PDF...</p>
          </div>
        }
        className="flex flex-col items-center"
      >
        <Page
          pageNumber={pageNumber}
          width={pageWidth}
          className="shadow-md"
          loading={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }
        />
      </Document>

      {/* Page Navigation */}
      {numPages > 0 && (
        <div className="flex items-center gap-3 py-4 w-full justify-center border-t mt-2">
          <Button
            variant="outline"
            size="icon"
            disabled={pageNumber <= 1}
            onClick={goToPrevPage}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[60px] text-center select-none">
            {pageNumber} / {numPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={pageNumber >= numPages}
            onClick={goToNextPage}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
