"use client";

import {
  FileText,
  FolderOpen,
  Shield,
  BookOpen,
  Globe,
  Rocket,
  Zap,
  Database,
  Code,
  Layers,
  Box,
  Share2,
  Cloud,
  Lock,
  Star,
  Heart,
  Briefcase,
  Building2,
  type LucideProps,
} from "lucide-react";
import { type ComponentType } from "react";

const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  "file-text": FileText,
  "folder-open": FolderOpen,
  shield: Shield,
  "book-open": BookOpen,
  globe: Globe,
  rocket: Rocket,
  zap: Zap,
  database: Database,
  code: Code,
  layers: Layers,
  box: Box,
  "share-2": Share2,
  cloud: Cloud,
  lock: Lock,
  star: Star,
  heart: Heart,
  briefcase: Briefcase,
  "building-2": Building2,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = ICON_MAP[name] || FileText;
  return <IconComponent {...props} />;
}
