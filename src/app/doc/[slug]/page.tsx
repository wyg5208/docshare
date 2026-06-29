import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DocumentPreview } from "@/components/document/document-preview";

export const dynamic = "force-dynamic";
import { DocumentActions } from "@/components/document/document-actions";
import { Badge } from "@/components/ui/badge";
import { FileIcon } from "@/components/document/file-icon";
import { formatBytes, formatDate, getFileTypeCategory } from "@/lib/utils";
import { Calendar, Eye, Download, FolderOpen } from "lucide-react";
import Link from "next/link";

interface DocumentPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch document with relations
  const { data: document } = await supabase
    .from("documents")
    .select("*, categories(name, slug), profiles(username, display_name)")
    .eq("slug", slug)
    .single();

  if (!document) {
    notFound();
  }

  // Log document view & increment view count
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (currentUser) {
    await Promise.all([
      supabase.from("access_logs").insert({
        user_id: currentUser.id,
        action: "document_view" as const,
        document_id: document.id,
      }),
      supabase
        .from("documents")
        .update({ view_count: (document.view_count || 0) + 1 })
        .eq("id", document.id),
    ]);
  }

  // Fetch tags for this document
  const { data: documentTags } = await supabase
    .from("document_tags")
    .select("tags(id, name, slug, color)")
    .eq("document_id", document.id);

  const tags = documentTags?.flatMap((dt) => dt.tags) || [];

  // Check if current user can download this document
  // Uses RPC to call has_document_permission() for unified permission logic
  const user = currentUser;
  let canDownload = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin" || document.uploaded_by === user.id) {
      canDownload = true;
    } else if (profile?.role === "editor") {
      // Editor role: baseline grants download on any document they can see
      canDownload = true;
    } else {
      // Viewer: call database function for unified permission check
      // (covers direct perms + group perms + category perms + group category perms)
      const { data: hasDownload } = await supabase.rpc('has_document_permission', {
        doc_id: document.id,
        required_perm: 'download'
      });
      canDownload = hasDownload === true;
    }
  }

  // Generate signed URL for file access
  const { data: urlData } = await supabase.storage
    .from("documents")
    .createSignedUrl(document.file_path, 3600);

  const fileUrl = urlData?.signedUrl || "";
  const typeCategory = getFileTypeCategory(document.file_type);

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Title & Actions */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold mb-4">{document.title}</h1>
              <DocumentActions document={document} fileUrl={fileUrl} canDownload={canDownload} />
            </div>

            {/* Preview */}
            <div className="border rounded-xl overflow-auto bg-muted/20 mb-6">
              <DocumentPreview
                type={typeCategory}
                fileUrl={fileUrl}
                fileName={document.file_name}
                fileType={document.file_type}
              />
            </div>

            {/* Description */}
            {document.description && (
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {document.description}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* File Info Card */}
              <div className="border rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <FileIcon type={document.file_type} className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{document.file_name}</p>
                    <p className="text-xs text-muted-foreground">{document.file_type}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Uploaded {formatDate(document.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{document.view_count} views</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Download className="h-4 w-4" />
                    <span>{document.download_count} downloads</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{formatBytes(document.file_size)}</span>
                  </div>
                </div>

                {document.categories && (
                  <div className="pt-2 border-t">
                    <Link
                      href={`/browse/${document.categories.slug}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <FolderOpen className="h-4 w-4" />
                      {document.categories.name}
                    </Link>
                  </div>
                )}

                {document.profiles && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Uploaded by{" "}
                      <span className="font-medium text-foreground">
                        {document.profiles.display_name || document.profiles.username}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="border rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Link key={tag.id} href={`/tags/${tag.slug}`}>
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          style={{ borderColor: tag.color, color: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
