"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function DeleteButton({
  table,
  id,
  label = "an item",
}: {
  table: "case_studies" | "blog_posts";
  id: string;
  label?: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete ${label}? This can't be undone.`)) return;

    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from(table).delete().eq("id", id);
    setDeleting(false);

    if (error) {
      console.error(`[DeleteButton] Failed to delete from ${table}:`, error);
      window.alert("Couldn't delete — try again.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs text-muted transition-colors hover:text-accent disabled:opacity-60"
    >
      {deleting ? "Deleting…" : "Delete"}
    </button>
  );
}
