import {
  FileText,
  Image,
  Video,
  Music,
  FileCode,
  File,
  Presentation,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileIconProps {
  type: string;
  className?: string;
}

const iconMap: Record<string, React.ElementType> = {
  "application/pdf": FileText,
  "application/msword": FileText,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": FileText,
  "text/plain": FileText,
  "text/html": FileCode,
  "image/jpeg": Image,
  "image/png": Image,
  "image/gif": Image,
  "image/webp": Image,
  "image/svg+xml": Image,
  "video/mp4": Video,
  "video/x-msvideo": Video,
  "video/webm": Video,
  "audio/mpeg": Music,
  "audio/wav": Music,
  "audio/ogg": Music,
  "audio/webm": Music,
  "application/vnd.ms-powerpoint": Presentation,
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": Presentation,
};

export function FileIcon({ type, className }: FileIconProps) {
  const IconComponent = iconMap[type] || File;
  return <IconComponent className={cn("h-5 w-5", className)} />;
}

export function getFileColor(type: string): string {
  if (type.startsWith("image/")) return "text-green-500";
  if (type.startsWith("video/")) return "text-purple-500";
  if (type.startsWith("audio/")) return "text-orange-500";
  if (type === "application/pdf") return "text-red-500";
  if (type === "text/html" || type === "text/plain") return "text-blue-500";
  return "text-gray-500";
}
