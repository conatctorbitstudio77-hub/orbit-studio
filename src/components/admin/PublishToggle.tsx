"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function PublishToggle({
  table,
  id,
  published,
}: {
  table: "case_studies" | "blog_posts";
  id: string;
  published: boolean;
}) {
  const [value, setValue] = useState(published);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function toggle() {
    const next = !value;
    setValue(next);
    setSaving(true);
    setError(false);

    const supabase = createClient();
    const update: Record<string, unknown> = { published: next };
    if (table === "blog_posts" && next) {
      update.published_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase.from(table).update(update).eq("id", id);
    setSaving(false);
    if (updateError) {
      console.error(`[PublishToggle] Failed to update ${table}:`, updateError);
      setValue(!next);
      setError(true);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
          value
            ? "border-accent bg-accent/10 text-accent-text"
            : "border-border bg-surface-muted text-muted"
        }`}
      >
        {value ? "Published" : "Draft"}
      </button>
      {error && <span className="text-xs text-accent">Couldn&apos;t save</span>}
    </div>
  );
}
