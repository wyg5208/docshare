import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DocumentCard } from "@/components/document/document-card";
import { CategoryCard } from "@/components/category/category-card";

export const dynamic = "force-dynamic";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, FileText, FolderOpen, Search, Shield } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch editable hero copy from site_settings (falls back to defaults)
  const { data: settings } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["hero_title_main", "hero_title_highlight", "hero_subtitle"]);

  const settingsMap = Object.fromEntries(
    (settings || []).map((s: { key: string; value: string | null }) => [s.key, s.value])
  );

  const heroTitleMain =
    settingsMap.hero_title_main || "Your Documents,";
  const heroTitleHighlight =
    settingsMap.hero_title_highlight || "Organized & Accessible";
  const heroSubtitle =
    settingsMap.hero_subtitle ||
    "A modern platform to publish, organize, and share your documents. Support for PDFs, images, videos, audio files, and more.";

  // Fetch featured/recent documents (RLS handles per-user visibility)
  const { data: recentDocs } = await supabase
    .from("documents")
    .select("*, categories(name, slug)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);

  // Fetch categories with document counts
  const { data: categories } = await supabase
    .from("categories")
    .select("*, documents(count)")
    .eq("is_public", true)
    .order("sort_order");

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="container mx-auto px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {heroTitleMain}{" "}
                <span className="text-primary">{heroTitleHighlight}</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                {heroSubtitle}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/browse">
                  <Button size="lg" className="gap-2">
                    Browse Documents
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/search">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-y bg-muted/30">
          <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Multi-Format Support</h3>
                <p className="text-sm text-muted-foreground">
                  Upload and preview PDFs, images, videos, audio files, and more directly in the browser.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <FolderOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Organization</h3>
                <p className="text-sm text-muted-foreground">
                  Organize documents with categories, tags, and powerful search to find what you need instantly.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Access Control</h3>
                <p className="text-sm text-muted-foreground">
                  Fine-grained permissions to control who can view and manage your documents.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        {categories && categories.length > 0 && (
          <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Categories</h2>
              <Link href="/browse">
                <Button variant="ghost" className="gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Documents Section */}
        {recentDocs && recentDocs.length > 0 && (
          <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Recent Documents</h2>
              <Link href="/browse">
                <Button variant="ghost" className="gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentDocs.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {(!recentDocs || recentDocs.length === 0) && (!categories || categories.length === 0) && (
          <section className="container mx-auto px-4 py-24 text-center sm:px-6 lg:px-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Welcome to {APP_NAME}</h2>
            <p className="text-muted-foreground mb-6">
              No documents yet. Sign in as admin to start uploading documents.
            </p>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
