import { createClient } from "@/lib/supabase/server";
import { CategoryCard } from "@/components/category/category-card";
import { DocumentCard } from "@/components/document/document-card";
import { ITEMS_PER_PAGE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const supabase = await createClient();

  // Fetch all public categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*, documents(count)")
    .eq("is_public", true)
    .order("sort_order");

  // Fetch recent public documents
  const { data: documents } = await supabase
    .from("documents")
    .select("*, categories(name, slug)")
    .eq("status", "published")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Browse Documents</h1>

      {/* Categories Grid */}
      {categories && categories.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>
      )}

      {/* Documents Grid */}
      <section>
        <h2 className="text-xl font-semibold mb-4">All Documents</h2>
        {documents && documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No documents available yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
