"use client";

import dynamic from "next/dynamic";
import { FileIcon } from "./file-icon";

const ImageViewer = dynamic(() => import("./image-viewer"), { ssr: false });
const VideoPlayer = dynamic(() => import("./video-player"), { ssr: false });
const AudioPlayer = dynamic(() => import("./audio-player"), { ssr: false });
const PdfViewer = dynamic(() => import("./pdf-viewer"), { ssr: false });

interface DocumentPreviewProps {
  type: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

export function DocumentPreview({ type, fileUrl, fileName, fileType }: DocumentPreviewProps) {
  if (!fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <FileIcon type={fileType} className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-sm">Preview not available</p>
        <p className="text-xs mt-1">Please download the file to view it</p>
      </div>
    );
  }

  switch (type) {
    case "image":
      return <ImageViewer src={fileUrl} alt={fileName} />;

    case "video":
      return <VideoPlayer src={fileUrl} type={fileType} />;

    case "audio":
      return <AudioPlayer src={fileUrl} type={fileType} />;

    case "pdf":
      return <PdfViewer file={fileUrl} />;

    case "text":
    case "html":
      return <TextPreview url={fileUrl} type={type} />;

    default:
      return (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <FileIcon type={fileType} className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-sm">Preview not available for this file type</p>
          <p className="text-xs mt-1">{fileType}</p>
          <p className="text-xs mt-3 text-muted-foreground/70">Please use the Download button above if you have download permission.</p>
        </div>
      );
  }
}

function TextPreview({ url, type }: { url: string; type: string }) {
  if (type === "html") {
    return (
      <iframe
        src={url}
        sandbox="allow-same-origin"
        className="w-full h-[600px] border-0"
        title="HTML Preview"
      />
    );
  }

  return (
    <div className="p-6 max-h-[600px] overflow-auto">
      <pre className="text-sm font-mono whitespace-pre-wrap break-words text-foreground">
        Loading...
      </pre>
    </div>
  );
}
