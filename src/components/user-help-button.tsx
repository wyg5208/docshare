"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { HelpCircle, ChevronDown, ChevronRight } from "lucide-react";

interface HelpSection {
  title: string;
  content: string[];
}

const USER_HELP_SECTIONS: HelpSection[] = [
  {
    title: "Getting Started",
    content: [
      "DocShare is a document sharing platform where you can browse, search, preview, and download documents.",
      "No account is needed to browse public documents. Log in to bookmark documents, access private files, and manage your profile.",
      "Use the navigation bar at the top to access Browse, Tags, and Search pages.",
    ],
  },
  {
    title: "Creating an Account & Logging In",
    content: [
      "Click 'Sign Up' in the top-right corner to create a new account with your username, email, and password.",
      "Click 'Sign In' to log into your existing account.",
      "If you forget your password, click 'Forgot your password?' on the login page to receive a reset link via email.",
      "Your account may have a validity period set by the administrator — if expired, contact admin for renewal.",
    ],
  },
  {
    title: "Browsing & Searching Documents",
    content: [
      "Browse documents by category: click 'Browse' in the navigation bar to see all categories.",
      "Browse by tag: click 'Tags' to see all available tags and their associated documents.",
      "Use the search bar at the top of any page to find documents by title, description, or filename.",
      "On the search results page, use the file type filter to narrow results (PDF, Images, Video, Audio, etc.).",
    ],
  },
  {
    title: "Viewing & Previewing Documents",
    content: [
      "Click any document card to open its detail page with an inline preview.",
      "Supported previews: PDF (scrollable viewer), Images (full-size), Video (player), Audio (player), HTML (embedded), Text (formatted).",
      "For unsupported formats (e.g., Word .docx), a download button is shown instead.",
      "Document details include: file type, size, upload date, view/download counts, category, and tags.",
    ],
  },
  {
    title: "Downloading Documents",
    content: [
      "On the document detail page, click the 'Download' button to save the file to your device.",
      "Some documents may be set to 'view only' — the download button will be greyed out with a tooltip explaining the restriction.",
      "If you need download access, contact the administrator to request a permission upgrade.",
    ],
  },
  {
    title: "Bookmarks (Favorites)",
    content: [
      "Login required. Click the bookmark icon (⭐) on any document detail page to save it.",
      "Access your bookmarks from the user menu (click your avatar → 'Bookmarks') or navigate to /bookmarks.",
      "Click the bookmark icon again to remove a document from your bookmarks.",
    ],
  },
  {
    title: "Profile & Settings",
    content: [
      "Navigate to Settings (avatar menu → 'Settings') to manage your profile.",
      "You can update your display name, bio, and upload a custom avatar (JPG/PNG/GIF/WebP, max 5MB).",
      "To change your password, go to Settings → Security tab.",
    ],
  },
  {
    title: "Switching Themes",
    content: [
      "DocShare supports three visual themes: Light (default), Dark Night, and Sci-Fi Green.",
      "Click the theme icon in the top-right area of the navigation bar to switch themes.",
      "Your theme preference is saved in your browser and persists across page refreshes.",
    ],
  },
  {
    title: "FAQ",
    content: [
      "Do I need an account? — No, you can browse public documents freely. Login is needed for bookmarks, downloads (if restricted), and private documents.",
      "Why can't I download? — The admin may have set your permission to 'view only'. Contact admin for access.",
      "My account expired? — Your validity period has ended. Contact the administrator to extend your access.",
      "Max upload size? — 500MB per file (only users with upload permissions can upload).",
    ],
  },
];

export function UserHelpButton() {
  const [open, setOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Help Guide"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogClose onClose={() => setOpen(false)} />
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <HelpCircle className="h-5 w-5 text-primary" />
              User Guide
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-1 mt-2 overflow-y-auto min-h-0 flex-1">
            {USER_HELP_SECTIONS.map((section, index) => {
              const isExpanded = expandedSections.has(index);
              return (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(index)}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm font-semibold hover:bg-muted/50 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    {section.title}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-3 pt-1">
                      <ul className="space-y-2">
                        {section.content.map((item, i) => (
                          <li key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                            <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center shrink-0">
            DocShare User Guide &middot; For questions, contact the administrator.
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
