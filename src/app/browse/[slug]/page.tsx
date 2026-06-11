import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { DocumentCard } from "@/components/document/document-card";
import Link from "next/link";
import { ChevronRight, FolderOpen } from "lucide-react";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch category
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) {
    notFound();
  }

  // Fetch subcategories
  const { data: subcategories } = await supabase
    .from("categories")
    .select("*, documents(count)")
    .eq("parent_id", category.id)
    .eq("is_public", true)
    .order("sort_order");

  // Fetch documents in this category
  const { data: documents } = await supabase
    .from("documents")
    .select("*, categories(name, slug)")
    .eq("category_id", category.id)
    .eq("status", "published")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/browse" className="hover:text-foreground">Browse</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="rounded-full bg-primary/10 p-3">
          <FolderOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground text-sm mt-1">{category.description}</p>
          )}
        </div>
      </div>

      {/* Subcategories */}
      {subcategories && subcategories.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Subcategories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/browse/${sub.slug}`}
                className="flex items-center gap-2 p-3 rounded-lg border hover:border-primary/20 hover:bg-accent/50 transition-colors"
              >
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{sub.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Documents */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Documents ({documents?.length || 0})
        </h2>
        {documents && documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No documents in this category yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
