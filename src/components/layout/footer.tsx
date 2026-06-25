"use client";

import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { useSiteSettings } from "@/components/site-settings-provider";
import { DynamicIcon } from "@/lib/dynamic-icon";

export function Footer() {
  const { settings } = useSiteSettings();
  const displayName = settings.site_name || APP_NAME;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <DynamicIcon name={settings.site_icon} className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">{displayName}</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              {settings.footer_description}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/browse" className="text-sm text-muted-foreground hover:text-foreground">Browse</Link></li>
              <li><Link href="/search" className="text-sm text-muted-foreground hover:text-foreground">Search</Link></li>
              <li><Link href="/tags" className="text-sm text-muted-foreground hover:text-foreground">Tags</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Account</h3>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Sign In</Link></li>
              <li><Link href="/register" className="text-sm text-muted-foreground hover:text-foreground">Sign Up</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            {settings.footer_copyright || `\u00A9 ${year} ${displayName}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
