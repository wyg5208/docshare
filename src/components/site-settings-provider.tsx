"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/constants";

interface SiteSettings {
  site_name: string;
  site_icon: string;
  footer_description: string;
  footer_copyright: string;
}

const DEFAULTS: SiteSettings = {
  site_name: APP_NAME,
  site_icon: "file-text",
  footer_description:
    "A modern document publishing and sharing platform. Upload, organize, and share your documents with ease.",
  footer_copyright: "",
};

const GLOBAL_KEYS = ["site_name", "site_icon", "footer_description", "footer_copyright"];

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULTS,
  loading: true,
  refresh: () => {},
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", GLOBAL_KEYS);

    if (data && data.length > 0) {
      const map = Object.fromEntries(
        data.map((r: { key: string; value: string | null }) => [r.key, r.value ?? ""])
      );
      setSettings({
        site_name: map.site_name || DEFAULTS.site_name,
        site_icon: map.site_icon || DEFAULTS.site_icon,
        footer_description: map.footer_description || DEFAULTS.footer_description,
        footer_copyright: map.footer_copyright ?? DEFAULTS.footer_copyright,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const refresh = () => {
    setLoading(true);
    load();
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
