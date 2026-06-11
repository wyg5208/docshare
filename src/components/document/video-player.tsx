"use client";

interface VideoPlayerProps {
  src: string;
  type: string;
}

export default function VideoPlayer({ src, type }: VideoPlayerProps) {
  return (
    <div className="bg-black">
      <video
        src={src}
        controls
        className="w-full max-h-[70vh]"
        preload="metadata"
      >
        <source src={src} type={type} />
        Your browser does not support the video element.
      </video>
    </div>
  );
}
