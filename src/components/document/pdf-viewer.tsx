"use client";

interface PdfViewerProps {
  file: string;
}

export default function PdfViewer({ file }: PdfViewerProps) {
  // Simple iframe-based PDF viewer (react-pdf requires worker setup)
  return (
    <div className="relative">
      <iframe
        src={file}
        className="w-full h-[70vh] border-0"
        title="PDF Preview"
      />
      <noscript>
        <p className="p-4 text-center text-muted-foreground">
          Please enable JavaScript to view PDFs, or{" "}
          <a href={file} className="text-primary underline" download>
            download the file
          </a>
          .
        </p>
      </noscript>
    </div>
  );
}
