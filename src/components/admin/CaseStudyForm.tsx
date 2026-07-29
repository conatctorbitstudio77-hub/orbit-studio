"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { industries } from "@/lib/industries";
import { slugify } from "@/lib/admin/slug";
import { createClient } from "@/lib/supabase/client";
import type { CaseStudyRecord } from "@/lib/admin/types";

export function CaseStudyForm({
  initial,
  nextDisplayOrder,
}: {
  initial?: CaseStudyRecord;
  nextDisplayOrder?: number;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [industry, setIndustry] = useState(initial?.industry ?? industries[0]);
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [results, setResults] = useState(initial?.results ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnail_url ?? "");
  const [published, setPublished] = useState(initial?.published ?? false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;

    if (!title.trim() || !slug.trim() || !industry || !summary.trim()) {
      setError("Title, slug, industry, and summary are all required.");
      return;
    }

    setError("");
    setSaving(true);

    const record = {
      title: title.trim(),
      slug: slugify(slug),
      industry,
      summary: summary.trim(),
      results: results.trim() || null,
      thumbnail_url: thumbnailUrl.trim() || null,
      published,
    };

    const supabase = createClient();
    const { error: saveError } = initial
      ? await supabase.from("case_studies").update(record).eq("id", initial.id)
      : await supabase
          .from("case_studies")
          .insert({ ...record, display_order: nextDisplayOrder ?? 0 });

    setSaving(false);

    if (saveError) {
      console.error("[CaseStudyForm] Failed to save case study:", saveError);
      setError(
        saveError.code === "23505"
          ? "That slug is already in use — pick a different one."
          : saveError.message
      );
      return;
    }

    router.push("/admin/case-studies");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-2xl border border-border bg-surface p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-muted">Title</span>
          <input
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-muted">Slug</span>
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 font-mono text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-muted">Industry</span>
        <select
          required
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          {industries.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-muted">Summary</span>
        <textarea
          required
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-muted">Results (optional)</span>
        <input
          value={results}
          onChange={(e) => setResults(e.target.value)}
          placeholder="e.g. 40+ leads in the first month"
          className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-muted">Thumbnail image URL (optional)</span>
        <input
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          placeholder="https://…"
          className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <span className="text-xs text-muted">
          Leave blank to use the gradient placeholder thumbnail.
        </span>
      </label>

      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        Published — visible on the public /work page
      </label>

      {error && <p className="text-sm text-accent">{error}</p>}

      <div className="mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-ink transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30 active:scale-95 disabled:pointer-events-none disabled:opacity-60"
        >
          {saving ? "Saving…" : initial ? "Save changes" : "Create case study"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/case-studies")}
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
