"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { useSiteSettings } from "@/components/site-settings-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { IconPicker } from "@/components/admin/icon-picker";
import { ImageUploadPicker } from "@/components/admin/image-upload-picker";
import { DynamicIcon } from "@/lib/dynamic-icon";
import { HERO_PRESET_IMAGES } from "@/lib/preset-images";

// ─── Default values ────────────────────────────────────────────────────────────

const DEFAULTS = {
  // Brand
  site_name: "DocShare",
  site_icon: "file-text",
  // Hero
  hero_title_main: "Your Documents,",
  hero_title_highlight: "Organized & Accessible",
  hero_subtitle:
    "A modern platform to publish, organize, and share your documents. Support for PDFs, images, videos, audio files, and more.",
  // Feature cards
  features_visible: "true",
  feature_card_1_title: "Multi-Format Support",
  feature_card_1_desc:
    "Upload and preview PDFs, images, videos, audio files, and more directly in the browser.",
  feature_card_1_icon: "file-text",
  feature_card_2_title: "Smart Organization",
  feature_card_2_desc:
    "Organize documents with categories, tags, and powerful search to find what you need instantly.",
  feature_card_2_icon: "folder-open",
  feature_card_3_title: "Access Control",
  feature_card_3_desc:
    "Fine-grained permissions to control who can view and manage your documents.",
  feature_card_3_icon: "shield",
  // Sections
  categories_visible: "true",
  // Footer
  footer_description:
    "A modern document publishing and sharing platform. Upload, organize, and share your documents with ease.",
  footer_copyright: "",
  // Hero background
  hero_bg_type: "gradient",
  hero_bg_image: "",
};

type SettingKey = keyof typeof DEFAULTS;

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AdminSiteSettingsPage() {
  const supabase = createClient();
  const { user } = useAuth();
  const { refresh: refreshGlobalSettings } = useSiteSettings();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<SettingKey, string>>({ ...DEFAULTS });

  // Load all settings on mount
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value");

      if (error) {
        toast("error", error.message);
        setLoading(false);
        return;
      }

      const map = Object.fromEntries(
        (data || []).map((r: { key: string; value: string | null }) => [r.key, r.value ?? ""])
      );

      const merged: Record<string, string> = { ...DEFAULTS };
      for (const key of Object.keys(DEFAULTS)) {
        if (map[key] !== undefined && map[key] !== "") {
          merged[key] = map[key];
        }
      }
      setForm(merged as Record<SettingKey, string>);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save a subset of keys
  const handleSave = async (keys: SettingKey[]) => {
    if (!user) return;
    setSaving(true);

    const rows = keys.map((key) => ({
      key,
      value: form[key],
      updated_by: user.id,
    }));

    const { error } = await supabase
      .from("site_settings")
      .upsert(rows, { onConflict: "key" });

    if (error) {
      toast("error", error.message);
    } else {
      toast("success", "Settings saved. Refresh relevant pages to see changes.");
      refreshGlobalSettings();
    }
    setSaving(false);
  };

  // Reset a subset of keys to defaults
  const handleReset = (keys: SettingKey[]) => {
    const updated = { ...form };
    for (const key of keys) {
      updated[key] = DEFAULTS[key];
    }
    setForm(updated);
    toast("success", "Restored defaults. Click Save to apply.");
  };

  // Shorthand setter
  const set = (key: SettingKey, value: string) => setForm((f) => ({ ...f, [key]: value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Site Content</h1>
        <p className="text-muted-foreground">
          Manage your site branding, homepage content, and footer across all pages.
        </p>
      </div>

      <Tabs defaultValue="brand">
        <TabsList className="flex-wrap">
          <TabsTrigger value="brand">Brand</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        {/* ─── Brand Tab ─────────────────────────────────────────── */}
        <TabsContent value="brand" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How the navigation logo will appear.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 p-4 rounded-lg border bg-background">
                <DynamicIcon name={form.site_icon} className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">{form.site_name || "Site Name"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand Settings</CardTitle>
              <CardDescription>Site name and icon used in the navigation bar and footer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  value={form.site_name}
                  onChange={(e) => set("site_name", e.target.value)}
                  placeholder="DocShare"
                />
              </div>

              <div className="space-y-2">
                <Label>Site Icon</Label>
                <IconPicker value={form.site_icon} onChange={(v) => set("site_icon", v)} />
              </div>

              <SaveResetButtons
                saving={saving}
                onSave={() => handleSave(["site_name", "site_icon"])}
                onReset={() => handleReset(["site_name", "site_icon"])}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Hero Tab ──────────────────────────────────────────── */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How it will appear on the homepage.</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="relative rounded-lg border overflow-hidden"
              >
                {/* Background */}
                {form.hero_bg_type !== "gradient" && (form.hero_bg_image || form.hero_bg_type === "preset") ? (
                  <div className="absolute inset-0">
                    <img
                      src={
                        form.hero_bg_type === "preset"
                          ? HERO_PRESET_IMAGES.find((p) => p.id === form.hero_bg_image)?.thumbnail ||
                            form.hero_bg_image
                          : form.hero_bg_image
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
                )}
                {/* Content */}
                <div className="relative p-8 text-center">
                  <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                    form.hero_bg_type !== "gradient" && form.hero_bg_image ? "text-white" : ""
                  }`}>
                    {form.hero_title_main || <span className="text-muted-foreground">[main title]</span>}{" "}
                    <span className={form.hero_bg_type !== "gradient" && form.hero_bg_image ? "text-white/90" : "text-primary"}>
                      {form.hero_title_highlight || <span className="text-muted-foreground">[highlight]</span>}
                    </span>
                  </h1>
                  <p className={`mt-4 text-sm leading-relaxed whitespace-pre-line ${
                    form.hero_bg_type !== "gradient" && form.hero_bg_image ? "text-white/80" : "text-muted-foreground"
                  }`}>
                    {form.hero_subtitle || <span className="italic">[subtitle]</span>}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hero Background</CardTitle>
              <CardDescription>
                Choose a background style for the homepage hero section.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUploadPicker
                label="Background Image"
                value={form.hero_bg_image}
                onChange={(url) => set("hero_bg_image", url)}
                mode={(form.hero_bg_type === "gradient" ? "none" : form.hero_bg_type) as "none" | "preset" | "custom"}
                onModeChange={(m) => {
                  set("hero_bg_type", m === "none" ? "gradient" : m);
                  if (m === "none") set("hero_bg_image", "");
                }}
                presets={HERO_PRESET_IMAGES}
                uploadPath="uploads/hero"
              />

              <SaveResetButtons
                saving={saving}
                onSave={() => handleSave(["hero_bg_type", "hero_bg_image"])}
                onReset={() => handleReset(["hero_bg_type", "hero_bg_image"])}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>
                The headline is split into two parts. The highlight portion is rendered in the primary accent color.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero_title_main">Title — Main</Label>
                <Input
                  id="hero_title_main"
                  value={form.hero_title_main}
                  onChange={(e) => set("hero_title_main", e.target.value)}
                  placeholder="Your Documents,"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero_title_highlight">Title — Highlight</Label>
                <Input
                  id="hero_title_highlight"
                  value={form.hero_title_highlight}
                  onChange={(e) => set("hero_title_highlight", e.target.value)}
                  placeholder="Organized & Accessible"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero_subtitle">Subtitle</Label>
                <Textarea
                  id="hero_subtitle"
                  value={form.hero_subtitle}
                  onChange={(e) => set("hero_subtitle", e.target.value)}
                  placeholder="A modern platform to publish..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">Line breaks are preserved.</p>
              </div>

              <SaveResetButtons
                saving={saving}
                onSave={() => handleSave(["hero_title_main", "hero_title_highlight", "hero_subtitle"])}
                onReset={() => handleReset(["hero_title_main", "hero_title_highlight", "hero_subtitle"])}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Features Tab ──────────────────────────────────────── */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>The three feature cards below the hero section.</CardDescription>
            </CardHeader>
            <CardContent>
              {form.features_visible === "false" ? (
                <p className="text-sm text-muted-foreground italic text-center py-4">
                  Feature cards are hidden on the homepage.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => {
                    const titleKey = `feature_card_${i}_title` as SettingKey;
                    const descKey = `feature_card_${i}_desc` as SettingKey;
                    const iconKey = `feature_card_${i}_icon` as SettingKey;
                    return (
                      <div key={i} className="flex flex-col items-center text-center p-3 rounded-lg border">
                        <div className="rounded-full bg-primary/10 p-2 mb-2">
                          <DynamicIcon name={form[iconKey]} className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-xs font-semibold">{form[titleKey]}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{form[descKey]}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Cards</CardTitle>
              <CardDescription>Edit or hide the feature highlight cards on the homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Visibility toggle */}
              <div className="flex items-center gap-3">
                <Label>Show on homepage</Label>
                <button
                  type="button"
                  onClick={() => set("features_visible", form.features_visible === "true" ? "false" : "true")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.features_visible === "true" ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.features_visible === "true" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Card editors */}
              {[1, 2, 3].map((i) => {
                const titleKey = `feature_card_${i}_title` as SettingKey;
                const descKey = `feature_card_${i}_desc` as SettingKey;
                const iconKey = `feature_card_${i}_icon` as SettingKey;
                return (
                  <div key={i} className="space-y-3 p-4 rounded-lg border">
                    <h4 className="text-sm font-semibold">Card {i}</h4>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={form[titleKey]} onChange={(e) => set(titleKey, e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={form[descKey]} onChange={(e) => set(descKey, e.target.value)} rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <IconPicker value={form[iconKey]} onChange={(v) => set(iconKey, v)} />
                    </div>
                  </div>
                );
              })}

              <SaveResetButtons
                saving={saving}
                onSave={() =>
                  handleSave([
                    "features_visible",
                    "feature_card_1_title", "feature_card_1_desc", "feature_card_1_icon",
                    "feature_card_2_title", "feature_card_2_desc", "feature_card_2_icon",
                    "feature_card_3_title", "feature_card_3_desc", "feature_card_3_icon",
                  ])
                }
                onReset={() =>
                  handleReset([
                    "features_visible",
                    "feature_card_1_title", "feature_card_1_desc", "feature_card_1_icon",
                    "feature_card_2_title", "feature_card_2_desc", "feature_card_2_icon",
                    "feature_card_3_title", "feature_card_3_desc", "feature_card_3_icon",
                  ])
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Sections Tab ──────────────────────────────────────── */}
        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Sections</CardTitle>
              <CardDescription>Control which sections are visible on the homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Categories</p>
                  <p className="text-sm text-muted-foreground">Show the categories grid on the homepage.</p>
                </div>
                <button
                  type="button"
                  onClick={() => set("categories_visible", form.categories_visible === "true" ? "false" : "true")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.categories_visible === "true" ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.categories_visible === "true" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <SaveResetButtons
                saving={saving}
                onSave={() => handleSave(["categories_visible"])}
                onReset={() => handleReset(["categories_visible"])}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Footer Tab ────────────────────────────────────────── */}
        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How the footer brand area will appear.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg border space-y-2">
                <div className="flex items-center gap-2">
                  <DynamicIcon name={form.site_icon} className="h-5 w-5 text-primary" />
                  <span className="text-lg font-bold">{form.site_name || "Site Name"}</span>
                </div>
                <p className="text-sm text-muted-foreground">{form.footer_description}</p>
                <div className="pt-2 border-t mt-3">
                  <p className="text-xs text-muted-foreground">
                    {form.footer_copyright || `\u00A9 ${new Date().getFullYear()} ${form.site_name || "Site Name"}. All rights reserved.`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Footer Content</CardTitle>
              <CardDescription>Edit the brand description and copyright line shown in the site footer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="footer_description">Brand Description</Label>
                <Textarea
                  id="footer_description"
                  value={form.footer_description}
                  onChange={(e) => set("footer_description", e.target.value)}
                  placeholder="A modern document publishing and sharing platform."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer_copyright">Copyright Text</Label>
                <Input
                  id="footer_copyright"
                  value={form.footer_copyright}
                  onChange={(e) => set("footer_copyright", e.target.value)}
                  placeholder="Leave empty for default: © 2026 SiteName. All rights reserved."
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use the auto-generated default.
                </p>
              </div>

              <SaveResetButtons
                saving={saving}
                onSave={() => handleSave(["footer_description", "footer_copyright"])}
                onReset={() => handleReset(["footer_description", "footer_copyright"])}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Shared Save/Reset buttons ─────────────────────────────────────────────────

function SaveResetButtons({
  saving,
  onSave,
  onReset,
}: {
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <Button onClick={onSave} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Changes
      </Button>
      <Button variant="outline" onClick={onReset} disabled={saving} className="gap-2">
        <RotateCcw className="h-4 w-4" />
        Restore Defaults
      </Button>
    </div>
  );
}
