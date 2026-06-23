import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { DocumentCard } from "@/components/document/document-card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { ChevronRight, Tag } from "lucide-react";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch tag
  const { data: tag } = await supabase
    .from("tags")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!tag) {
    notFound();
  }

  // Fetch documents with this tag
  const { data: documentTags } = await supabase
    .from("document_tags")
    .select("document_id")
    .eq("tag_id", tag.id);

  const docIds = documentTags?.map((dt) => dt.document_id) || [];

  let documents = [];
  if (docIds.length > 0) {
    // RLS handles per-user visibility (public docs OR explicitly granted)
    const { data } = await supabase
      .from("documents")
      .select("*, categories(name, slug)")
      .in("id", docIds)
      .eq("status", "published")
      .order("created_at", { ascending: false });
    documents = data || [];
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/tags" className="hover:text-foreground">Tags</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{tag.name}</span>
      </nav>

      {/* Tag Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="rounded-full bg-primary/10 p-3">
          <Tag className="h-6 w-6" style={{ color: tag.color }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Badge style={{ backgroundColor: tag.color, borderColor: tag.color }}>
              {tag.name}
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {documents.length} document{documents.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Documents */}
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p>No documents with this tag yet.</p>
        </div>
      )}
      </main>
      <Footer />
    </>
  );
}
