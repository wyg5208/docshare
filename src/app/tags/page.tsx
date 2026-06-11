import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const supabase = await createClient();

  const { data: tags } = await supabase
    .from("tags")
    .select("*, document_tags(count)")
    .order("name");

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Tags</h1>

      {tags && tags.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => {
            const count = (tag.document_tags as unknown as { count: number }[])?.[0]?.count ?? 0;
            return (
              <Link key={tag.id} href={`/tags/${tag.slug}`}>
                <Badge
                  variant="outline"
                  className="px-4 py-2 text-sm font-medium hover:bg-accent transition-colors cursor-pointer gap-2"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  <Tag className="h-3 w-3" />
                  {tag.name}
                  <span className="text-muted-foreground text-xs">({count})</span>
                </Badge>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No tags available yet.</p>
        </div>
      )}
    </div>
  );
}
