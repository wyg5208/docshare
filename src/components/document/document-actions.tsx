"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Download, Bookmark, BookmarkCheck } from "lucide-react";
import type { Document } from "@/lib/types";

interface DocumentActionsProps {
  document: Document;
  fileUrl: string;
  canDownload?: boolean;
}

export function DocumentActions({ document, fileUrl, canDownload = true }: DocumentActionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleDownload = async () => {
    // Log download
    if (user) {
      await supabase.from("access_logs").insert({
        user_id: user.id,
        action: "document_download",
        document_id: document.id,
      });

      // Increment download count
      await supabase
        .from("documents")
        .update({ download_count: document.download_count + 1 })
        .eq("id", document.id);
    }

    // Trigger download
    const a = window.document.createElement("a");
    a.href = fileUrl;
    a.download = document.file_name;
    a.click();

    toast("success", "Download started");
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast("info", "Please sign in to bookmark documents");
      return;
    }

    setLoading(true);

    if (bookmarked) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("document_id", document.id);
      setBookmarked(false);
      toast("info", "Bookmark removed");
    } else {
      await supabase.from("bookmarks").insert({
        user_id: user.id,
        document_id: document.id,
      });
      setBookmarked(true);
      toast("success", "Document bookmarked");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      {canDownload ? (
        <Button onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Download
        </Button>
      ) : (
        <Button disabled className="gap-2 opacity-50 cursor-not-allowed" title="You only have view permission for this document">
          <Download className="h-4 w-4" />
          Download
        </Button>
      )}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleBookmark}
        disabled={loading}
      >
        {bookmarked ? (
          <BookmarkCheck className="h-4 w-4 text-primary" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
