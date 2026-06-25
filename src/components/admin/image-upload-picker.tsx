"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, ImageIcon, Check } from "lucide-react";
import type { PresetImage, CoverColor } from "@/lib/preset-images";

// ─── Types ──────────────────────────────────────────────────────────────────

type ImageMode = "none" | "preset" | "custom" | "color";

interface ImageUploadPickerProps {
  /** Current image URL (preset or custom) */
  value: string;
  /** Callback when image changes. Returns the URL or "" for none */
  onChange: (url: string) => void;
  /** Current mode */
  mode: ImageMode;
  /** Callback when mode changes */
  onModeChange: (mode: ImageMode) => void;
  /** List of preset images to choose from */
  presets?: PresetImage[];
  /** List of color presets (for document covers) */
  colors?: CoverColor[];
  /** Selected color value */
  colorValue?: string;
  /** Callback when color changes */
  onColorChange?: (color: string) => void;
  /** Storage path prefix for uploads (e.g., "uploads/hero") */
  uploadPath?: string;
  /** Max file size in bytes (default: 5MB) */
  maxSize?: number;
  /** Label for the component */
  label?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ImageUploadPicker({
  value,
  onChange,
  mode,
  onModeChange,
  presets = [],
  colors = [],
  colorValue = "",
  onColorChange,
  uploadPath = "uploads/images",
  maxSize = 5 * 1024 * 1024,
  label = "Image",
}: ImageUploadPickerProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const showColors = colors.length > 0;

  // Mode options
  const modeOptions: { key: ImageMode; label: string }[] = [
    { key: "none", label: "None" },
    ...(showColors ? [{ key: "color" as ImageMode, label: "Color" }] : []),
    ...(presets.length > 0 ? [{ key: "preset" as ImageMode, label: "Preset" }] : []),
    { key: "custom", label: "Upload" },
  ];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      toast("error", `File size must be under ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast("error", "Please select an image file");
      return;
    }

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${uploadPath}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      onChange(urlData.publicUrl);
      toast("success", "Image uploaded successfully");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast("error", message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-medium">{label}</p>}

      {/* Mode Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {modeOptions.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => {
              onModeChange(opt.key);
              if (opt.key === "none") {
                onChange("");
                onColorChange?.("");
              }
            }}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === opt.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Color Picker */}
      {mode === "color" && showColors && (
        <div className="grid grid-cols-6 gap-2">
          {colors.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onColorChange?.(c.color)}
              className="relative aspect-square rounded-lg border-2 transition-all hover:scale-105"
              style={{
                backgroundColor: c.color,
                borderColor: colorValue === c.color ? "white" : c.color,
                boxShadow: colorValue === c.color ? `0 0 0 2px ${c.color}` : "none",
              }}
              title={c.label}
            >
              {colorValue === c.color && (
                <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Preset Grid */}
      {mode === "preset" && presets.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-1">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.url)}
              className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-[1.02] ${
                value === preset.url
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent hover:border-muted-foreground/30"
              }`}
            >
              <img
                src={preset.thumbnail}
                alt={preset.label}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {value === preset.url && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <Check className="h-5 w-5 text-white drop-shadow" />
                </div>
              )}
              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center py-0.5 truncate">
                {preset.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Custom Upload */}
      {mode === "custom" && (
        <div className="space-y-2">
          {value && mode === "custom" ? (
            <div className="relative rounded-lg overflow-hidden border">
              <img
                src={value}
                alt="Custom upload"
                className="w-full aspect-video object-cover"
              />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
              ) : (
                <>
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Click to upload an image (max {Math.round(maxSize / 1024 / 1024)}MB)
                  </p>
                </>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleUpload}
          />
          {value && mode === "custom" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              {uploading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ImageIcon className="h-3 w-3" />
              )}
              Replace Image
            </Button>
          )}
        </div>
      )}

      {/* Preview (for preset / custom when image selected) */}
      {(mode === "preset" || mode === "custom") && value && mode !== "custom" && (
        <div className="rounded-lg overflow-hidden border">
          <img
            src={value}
            alt="Selected preview"
            className="w-full aspect-video object-cover"
          />
        </div>
      )}
    </div>
  );
}
