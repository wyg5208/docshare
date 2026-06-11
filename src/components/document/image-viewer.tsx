"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageViewerProps {
  src: string;
  alt: string;
}

export default function ImageViewer({ src, alt }: ImageViewerProps) {
  const [scale, setScale] = useState(1);

  return (
    <div className="relative">
      <div className="overflow-auto max-h-[70vh] bg-[repeating-conic-gradient(#f1f1f1_0%_25%,#fff_0%_50%)] bg-[length:20px_20px]">
        <img
          src={src}
          alt={alt}
          className="mx-auto transition-transform"
          style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
        />
      </div>
      <div className="flex items-center justify-center gap-2 p-3 border-t bg-background">
        <Button variant="outline" size="sm" onClick={() => setScale(Math.max(0.25, scale - 0.25))}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <Button variant="outline" size="sm" onClick={() => setScale(Math.min(4, scale + 0.25))}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setScale(1)}>
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
