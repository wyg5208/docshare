"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { DocumentCard } from "@/components/document/document-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark as BookmarkIcon, FileText } from "lucide-react";
import type { Document, Category, Tag } from "@/lib/types";

interface BookmarkWithDoc {
  id: string;
  created_at: string;
  documents: Document & {
    categories: Category | null;
    tags: Tag[];
  };
}

export default function BookmarksPage() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkWithDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    const fetchBookmarks = async () => {
      const { data, error } = await supabase
        .from("bookmarks")
        .select(`
          id,
          created_at,
          documents (
            *,
            categories (*),
            tags (*)
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBookmarks(data as unknown as BookmarkWithDoc[]);
      }
      setLoading(false);
    };

    fetchBookmarks();
  }, [user]);

  const removeBookmark = async (bookmarkId: string) => {
    await supabase.from("bookmarks").delete().eq("id", bookmarkId);
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Bookmarks</h1>
        <p className="text-muted-foreground mt-2">
          Documents you&apos;ve saved for later reading.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <BookmarkIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No bookmarks yet</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Start exploring documents and bookmark the ones you want to read later.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <FileText className="h-4 w-4" />
            Browse Documents
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="relative group">
              <DocumentCard document={bookmark.documents as Document & { categories?: { name: string; slug: string } | null }} />
              <button
                onClick={() => removeBookmark(bookmark.id)}
                className="absolute top-3 right-3 z-10 rounded-full bg-background/90 p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                title="Remove bookmark"
              >
                <BookmarkIcon className="h-4 w-4 fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
