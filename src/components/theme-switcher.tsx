"use client";

import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { Sun, Moon, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

const THEMES = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
    preview: "bg-white border-gray-200",
  },
  {
    value: "dark",
    label: "Dark Night",
    icon: Moon,
    preview: "bg-[hsl(222.2_84%_4.9%)] border-blue-900",
  },
  {
    value: "matrix",
    label: "Sci-Fi Green",
    icon: Leaf,
    preview: "bg-[hsl(160_30%_5%)] border-green-900",
  },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-md hover:bg-accent" aria-label="Theme">
        <Sun className="h-4 w-4" />
      </button>
    );
  }

  const current = THEMES.find((t) => t.value === theme) || THEMES[0];
  const CurrentIcon = current.icon;

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Switch theme"
        title="Switch theme"
      >
        <CurrentIcon className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95">
          {THEMES.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.value;
            return (
              <button
                key={t.value}
                onClick={() => {
                  setTheme(t.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "hover:bg-accent/50 hover:text-accent-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border",
                    t.preview
                  )}
                >
                  <Icon className="h-3 w-3" />
                </div>
                <span>{t.label}</span>
                {isActive && (
                  <span className="ml-auto text-xs text-primary">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
