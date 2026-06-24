"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import {
  LayoutDashboard,
  Files,
  FolderTree,
  Tags,
  Users,
  Shield,
  BarChart3,
  PenSquare,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const iconMap: Record<string, React.ElementType> = {
  "layout-dashboard": LayoutDashboard,
  files: Files,
  "folder-tree": FolderTree,
  tags: Tags,
  users: Users,
  shield: Shield,
  "bar-chart-3": BarChart3,
  "pen-square": PenSquare,
};

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <nav className="flex-1 p-4 space-y-1">
      {ADMIN_NAV_ITEMS.map((item) => {
        const Icon = iconMap[item.icon] || LayoutDashboard;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-md bg-background border shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 h-full bg-sidebar-background border-r flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-bold text-lg">Admin Panel</h2>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-sidebar-background border-r flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg">Admin Panel</h2>
        </div>
        <SidebarContent />
      </aside>
    </>
  );
}
