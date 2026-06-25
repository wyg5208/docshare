import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileIcon } from "@/components/document/file-icon";
import { formatBytes, formatDate } from "@/lib/utils";
import { Eye } from "lucide-react";
import type { Document } from "@/lib/types";

interface DocumentCardProps {
  document: Document & {
    categories?: { name: string; slug: string } | null;
  };
}

export function DocumentCard({ document }: DocumentCardProps) {
  const hasCoverImage = !!document.thumbnail_url;
  const hasCoverColor = !!document.cover_color && !hasCoverImage;

  return (
    <Link href={`/doc/${document.slug}`}>
      <Card className="group h-full transition-all hover:shadow-md hover:border-primary/20">
        {/* Thumbnail/Icon Area */}
        <div
          className={`aspect-video rounded-t-xl flex items-center justify-center overflow-hidden ${
            !hasCoverImage && !hasCoverColor ? "bg-muted/50" : ""
          }`}
          style={
            hasCoverColor
              ? { backgroundColor: document.cover_color! }
              : undefined
          }
        >
          {hasCoverImage ? (
            <img
              src={document.thumbnail_url!}
              alt={document.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
            />
          ) : (
            <FileIcon
              type={document.file_type}
              className={`h-12 w-12 ${
                hasCoverColor ? "text-white/90" : "text-muted-foreground"
              }`}
            />
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start gap-2 mb-2">
            <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors flex-1">
              {document.title}
            </h3>
          </div>
          {document.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {document.description}
            </p>
          )}
          {document.categories && (
            <Badge variant="secondary" className="text-xs">
              {document.categories.name}
            </Badge>
          )}
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(document.created_at)}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {document.view_count}
            </span>
            <span>{formatBytes(document.file_size)}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
