"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { slugify } from "@/lib/admin/slug";
import { createClient } from "@/lib/supabase/client";
import type { BlogPostRecord } from "@/lib/admin/types";

export function BlogPostForm({ initial }: { initial?: BlogPostRecord }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
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

    if (!title.trim() || !slug.trim() || !excerpt.trim() || !body.trim()) {
      setError("Title, slug, excerpt, and body are all required.");
      return;
    }

    setError("");
    setSaving(true);

    const wasPublished = initial?.published ?? false;
    const record = {
      title: title.trim(),
      slug: slugify(slug),
      excerpt: excerpt.trim(),
      body,
      published,
      // Set published_at the first time a post goes live; never overwrite it on later edits.
      ...(published && !wasPublished ? { published_at: new Date().toISOString() } : {}),
    };

    const supabase = createClient();
    const { error: saveError } = initial
      ? await supabase.from("blog_posts").update(record).eq("id", initial.id)
      : await supabase.from("blog_posts").insert(record);

    setSaving(false);

    if (saveError) {
      console.error("[BlogPostForm] Failed to save post:", saveError);
      setError(
        saveError.code === "23505"
          ? "That slug is already in use — pick a different one."
          : saveError.message
      );
      return;
    }

    router.push("/admin/blog");
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
        <span className="text-muted">Excerpt</span>
        <textarea
          required
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-muted">Body (Markdown)</span>
        <textarea
          required
          rows={16}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={"## A section heading\n\nRegular paragraph text. **Bold** and _italic_ work, along with:\n\n- bullet lists\n- [links](https://example.com)"}
          className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 font-mono text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </label>

      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        Published — visible on the public /blog page
      </label>

      {error && <p className="text-sm text-accent">{error}</p>}

      <div className="mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-ink transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30 active:scale-95 disabled:pointer-events-none disabled:opacity-60"
        >
          {saving ? "Saving…" : initial ? "Save changes" : "Create post"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/blog")}
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
