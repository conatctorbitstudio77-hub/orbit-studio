"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Neighbor = { id: string; display_order: number } | null;

export function ReorderButtons({
  id,
  order,
  prev,
  next,
}: {
  id: string;
  order: number;
  prev: Neighbor;
  next: Neighbor;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function swap(target: Neighbor) {
    if (!target || busy) return;
    setBusy(true);

    const supabase = createClient();
    const [a, b] = await Promise.all([
      supabase.from("case_studies").update({ display_order: target.display_order }).eq("id", id),
      supabase.from("case_studies").update({ display_order: order }).eq("id", target.id),
    ]);

    setBusy(false);
    if (a.error || b.error) {
      console.error("[ReorderButtons] Failed to reorder case study:", a.error || b.error);
      window.alert("Couldn't reorder — try again.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => swap(prev)}
        disabled={!prev || busy}
        aria-label="Move up"
        className="px-1 text-muted transition-colors hover:text-accent-text disabled:opacity-30"
      >
        ▲
      </button>
      <button
        type="button"
        onClick={() => swap(next)}
        disabled={!next || busy}
        aria-label="Move down"
        className="px-1 text-muted transition-colors hover:text-accent-text disabled:opacity-30"
      >
        ▼
      </button>
    </div>
  );
}
