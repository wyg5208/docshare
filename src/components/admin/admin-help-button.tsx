"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { HelpCircle, ChevronDown, ChevronRight } from "lucide-react";

interface HelpSection {
  title: string;
  content: string[];
}

const HELP_SECTIONS: HelpSection[] = [
  {
    title: "Dashboard Overview",
    content: [
      "The Dashboard displays key statistics: total documents, users, page views, and downloads.",
      "Recent activity shows the latest user actions including logins, document views, and downloads.",
      "Use the sidebar navigation to access different management sections.",
    ],
  },
  {
    title: "Managing Documents",
    content: [
      "Click 'Upload Document' to add a new file. Supported formats: PDF, DOCX, images, video, and audio (max 500MB).",
      "Fill in the title, description, select a category, and choose relevant tags before publishing.",
      "Set document status to 'Draft' to keep it private, or 'Published' to make it visible.",
      "Toggle 'Publicly accessible' to control whether non-logged-in users can view the document.",
      "Use the actions menu (⋮) on each document row to edit details or delete the document.",
      "When editing, you can optionally replace the file with a new version.",
    ],
  },
  {
    title: "Managing Categories",
    content: [
      "Categories organize documents in a hierarchical tree structure (parent and child categories).",
      "Click 'New Category' to create a category. Provide a name, description, and optionally select a parent category.",
      "A slug (URL-friendly identifier) is auto-generated from the category name.",
      "Deleting a category will not delete its documents — they will simply become uncategorized.",
    ],
  },
  {
    title: "Managing Tags",
    content: [
      "Tags provide flexible, cross-category labeling for documents.",
      "Click 'New Tag' to create a tag with a name and color (8 preset colors available).",
      "Documents can have multiple tags, and tags can be applied to multiple documents.",
      "Users can browse documents by tag on the public /tags page.",
    ],
  },
  {
    title: "Managing Users",
    content: [
      "View all registered users with their roles, status, and registration date.",
      "Change a user's role using the dropdown: Admin (full access), Editor (upload/manage docs), or Viewer (read-only).",
      "Disable a user account to prevent login without deleting their data.",
      "Re-enable a disabled user at any time by toggling their status back to active.",
    ],
  },
  {
    title: "Managing Permissions",
    content: [
      "By default, all published public documents are visible to everyone.",
      "Use the Permissions page to grant specific users access to individual documents or entire categories.",
      "Select a user, choose the target type (Document or Category), pick the specific item, and set the permission level.",
      "Permission levels: View (read-only), Edit (modify content), Manage (full control including deletion).",
      "Remove permissions by clicking the delete button on any permission entry.",
    ],
  },
  {
    title: "Analytics & Activity Logs",
    content: [
      "The Analytics page shows overall statistics: total page views, downloads, logins, and today's views.",
      "The activity log lists up to 100 recent events with user, action type, related document, and timestamp.",
      "Filter activity logs by type: Login, Document View, or Download.",
      "Use these insights to understand user engagement and popular content.",
    ],
  },
];

export function AdminHelpButton() {
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
        title="Admin Help"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogClose onClose={() => setOpen(false)} />
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <HelpCircle className="h-5 w-5 text-primary" />
              Admin Panel Help Guide
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-1 mt-2">
            {HELP_SECTIONS.map((section, index) => {
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

          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
            {APP_NAME} Admin Help &middot; For questions, contact the development team.
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

const APP_NAME = "DocShare";
