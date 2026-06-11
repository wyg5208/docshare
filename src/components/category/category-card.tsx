import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen } from "lucide-react";
import type { Category } from "@/lib/types";

interface CategoryCardProps {
  category: Category & {
    documents?: { count: number }[] | null;
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  const docCount = category.documents?.[0]?.count ?? 0;

  return (
    <Link href={`/browse/${category.slug}`}>
      <Card className="group h-full transition-all hover:shadow-md hover:border-primary/20">
        <CardContent className="p-4 flex flex-col items-center text-center">
          <div className="rounded-full bg-primary/10 p-3 mb-3 group-hover:bg-primary/20 transition-colors">
            <FolderOpen className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {docCount} {docCount === 1 ? "document" : "documents"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
