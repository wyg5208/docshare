"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Loader2, Save, RotateCcw } from "lucide-react";

const DEFAULTS = {
  hero_title_main: "Your Documents,",
  hero_title_highlight: "Organized & Accessible",
  hero_subtitle:
    "A modern platform to publish, organize, and share your documents. Support for PDFs, images, videos, audio files, and more.",
};

type SettingKey = keyof typeof DEFAULTS;

export default function AdminSiteSettingsPage() {
  const supabase = createClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroTitleMain, setHeroTitleMain] = useState("");
  const [heroTitleHighlight, setHeroTitleHighlight] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["hero_title_main", "hero_title_highlight", "hero_subtitle"]);

      if (error) {
        toast("error", error.message);
      }

      const map = Object.fromEntries(
        (data || []).map((r: { key: string; value: string | null }) => [r.key, r.value ?? ""])
      );

      setHeroTitleMain(map.hero_title_main ?? DEFAULTS.hero_title_main);
      setHeroTitleHighlight(map.hero_title_highlight ?? DEFAULTS.hero_title_highlight);
      setHeroSubtitle(map.hero_subtitle ?? DEFAULTS.hero_subtitle);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const rows: { key: SettingKey; value: string; updated_by: string }[] = [
      { key: "hero_title_main", value: heroTitleMain, updated_by: user.id },
      { key: "hero_title_highlight", value: heroTitleHighlight, updated_by: user.id },
      { key: "hero_subtitle", value: heroSubtitle, updated_by: user.id },
    ];

    const { error } = await supabase
      .from("site_settings")
      .upsert(rows, { onConflict: "key" });

    if (error) {
      toast("error", error.message);
    } else {
      toast("success", "Homepage content updated. Refresh the home page to see changes.");
    }
    setSaving(false);
  };

  const handleResetDefaults = () => {
    setHeroTitleMain(DEFAULTS.hero_title_main);
    setHeroTitleHighlight(DEFAULTS.hero_title_highlight);
    setHeroSubtitle(DEFAULTS.hero_subtitle);
    toast("success", "Restored default values. Click Save to apply.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Site Content</h1>
        <p className="text-muted-foreground">
          Edit the homepage hero text shown to all visitors (logged in or not).
        </p>
      </div>

      {/* Live preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>How it will appear on the homepage.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-gradient-to-b from-primary/5 via-background to-background p-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {heroTitleMain || <span className="text-muted-foreground">[main title]</span>}{" "}
              <span className="text-primary">
                {heroTitleHighlight || <span className="text-muted-foreground">[highlight]</span>}
              </span>
            </h1>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {heroSubtitle || <span className="italic">[subtitle]</span>}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
          <CardDescription>
            The headline is split into two parts. The highlight portion is rendered in the primary
            accent color.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero_title_main">Title — Main</Label>
            <Input
              id="hero_title_main"
              value={heroTitleMain}
              onChange={(e) => setHeroTitleMain(e.target.value)}
              placeholder="Your Documents,"
            />
            <p className="text-xs text-muted-foreground">
              Plain text portion of the headline. A trailing space is added automatically before the
              highlight.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero_title_highlight">Title — Highlight</Label>
            <Input
              id="hero_title_highlight"
              value={heroTitleHighlight}
              onChange={(e) => setHeroTitleHighlight(e.target.value)}
              placeholder="Organized & Accessible"
            />
            <p className="text-xs text-muted-foreground">
              Rendered in the accent color.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero_subtitle">Subtitle</Label>
            <Textarea
              id="hero_subtitle"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="A modern platform to publish, organize, and share your documents."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Line breaks are preserved.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={handleResetDefaults}
              disabled={saving}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Restore Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
