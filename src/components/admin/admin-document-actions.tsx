"use client";

import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminDocumentActionsProps {
  documentId: string;
}

export function AdminDocumentActions({ documentId }: AdminDocumentActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    const { error } = await supabase.from("documents").delete().eq("id", documentId);

    if (error) {
      toast("error", "Failed to delete document");
    } else {
      toast("success", "Document deleted");
      router.refresh();
    }
  };

  return (
    <DropdownMenu
      trigger={
        <button className="p-1 rounded-md hover:bg-muted">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      }
    >
      <DropdownMenuItem onClick={() => window.open(`/admin/documents/${documentId}/edit`, "_blank")}>
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleDelete} className="text-destructive">
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
