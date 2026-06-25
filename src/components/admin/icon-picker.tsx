"use client";

import { cn } from "@/lib/utils";
import { DynamicIcon, AVAILABLE_ICONS } from "@/lib/dynamic-icon";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  return (
    <div className={cn("grid grid-cols-6 sm:grid-cols-9 gap-2", className)}>
      {AVAILABLE_ICONS.map((iconName) => (
        <button
          key={iconName}
          type="button"
          onClick={() => onChange(iconName)}
          className={cn(
            "flex items-center justify-center p-2.5 rounded-md border transition-all",
            value === iconName
              ? "border-primary bg-primary/10 ring-2 ring-primary/30"
              : "border-border hover:border-primary/50 hover:bg-accent"
          )}
          title={iconName}
        >
          <DynamicIcon name={iconName} className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}
