"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { QuoteStatus } from "@/lib/admin/types";

const statuses: QuoteStatus[] = ["new", "contacted", "won", "lost"];

const statusStyles: Record<QuoteStatus, string> = {
  new: "border-accent bg-accent/10 text-accent-text",
  contacted: "border-border bg-surface-muted text-foreground",
  won: "border-deep-blue bg-deep-blue/10 text-deep-blue",
  lost: "border-border bg-surface-muted text-muted",
};

export function QuoteStatusSelect({
  id,
  status,
}: {
  id: string;
  status: QuoteStatus;
}) {
  const [value, setValue] = useState<QuoteStatus>(status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(next: QuoteStatus) {
    const previous = value;
    setValue(next);
    setSaving(true);
    setError("");

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("quotes")
      .update({ status: next })
      .eq("id", id);

    setSaving(false);
    if (updateError) {
      console.error("[QuoteStatusSelect] Failed to update status:", updateError);
      setValue(previous);
      setError("Couldn't save — try again.");
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={value}
        disabled={saving}
        onChange={(e) => handleChange(e.target.value as QuoteStatus)}
        className={`w-fit rounded-lg border px-2.5 py-1.5 text-xs font-medium capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-60 ${statusStyles[value]}`}
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-accent">{error}</span>}
    </div>
  );
}
