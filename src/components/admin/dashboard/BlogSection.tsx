"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AdminButton,
  AdminField,
  AdminTable,
  AdminTag,
  SectionHeading,
  adminInputClass,
} from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/client";
import type { BlogPostRecord } from "@/lib/admin/types";

type Draft = { title: string; published: boolean };
const emptyDraft: Draft = { title: "", published: false };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function BlogSection({ posts }: { posts: BlogPostRecord[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ title: "", excerpt: "", body: "" });
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!draft.title.trim()) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("blog_posts").insert({
      title: draft.title.trim(),
      slug: slugify(draft.title),
      excerpt: draft.title.trim(),
      body: "Write the post body here.",
      published: draft.published,
      published_at: draft.published ? new Date().toISOString() : null,
    });
    setBusy(false);
    if (error) {
      console.error("[BlogSection] Failed to add post:", error);
      window.alert(
        error.code === "23505" ? "That title/slug is already in use." : "Couldn't save — try again."
      );
      return;
    }
    setDraft(emptyDraft);
    setAdding(false);
    router.refresh();
  }

  function startEdit(post: BlogPostRecord) {
    setEditingId(post.id);
    setEditDraft({ title: post.title, excerpt: post.excerpt, body: post.body });
  }

  async function saveEdit(id: string) {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("blog_posts")
      .update({
        title: editDraft.title.trim(),
        excerpt: editDraft.excerpt.trim(),
        body: editDraft.body,
      })
      .eq("id", id);
    setBusy(false);
    if (error) {
      console.error("[BlogSection] Failed to save edit:", error);
      window.alert("Couldn't save — try again.");
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function toggleStatus(post: BlogPostRecord) {
    setBusy(true);
    const supabase = createClient();
    const nextPublished = !post.published;
    const update: Record<string, unknown> = { published: nextPublished };
    if (nextPublished && !post.published_at) update.published_at = new Date().toISOString();
    const { error } = await supabase.from("blog_posts").update(update).eq("id", post.id);
    setBusy(false);
    if (error) {
      console.error("[BlogSection] Failed to toggle status:", error);
      window.alert("Couldn't save — try again.");
      return;
    }
    router.refresh();
  }

  async function remove(id: string, title: string) {
    if (!window.confirm(`Remove "${title}"? This can't be undone.`)) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    setBusy(false);
    if (error) {
      console.error("[BlogSection] Failed to remove post:", error);
      window.alert("Couldn't remove — try again.");
      return;
    }
    router.refresh();
  }

  return (
    <section id="blog" className="mt-12 border-t border-border pb-2 pt-14">
      <SectionHeading
        kicker="Content"
        title="Blog"
        action={
          <AdminButton variant="primary" blueprint onClick={() => setAdding((v) => !v)}>
            {adding ? "Cancel" : "+ New post"}
          </AdminButton>
        }
      />

      {adding && (
        <div className="relative mb-5 border border-border bg-accent/10 p-6">
          <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
            <AdminField label="Title">
              <input
                className={adminInputClass}
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              />
            </AdminField>
            <AdminField label="Status">
              <select
                className={adminInputClass}
                value={draft.published ? "Published" : "Draft"}
                onChange={(e) => setDraft((d) => ({ ...d, published: e.target.value === "Published" }))}
              >
                <option>Draft</option>
                <option>Published</option>
              </select>
            </AdminField>
          </div>
          <div className="mt-4 flex gap-2">
            <AdminButton variant="primary" onClick={submit} disabled={busy}>
              Save post
            </AdminButton>
            <AdminButton onClick={() => setAdding(false)}>Cancel</AdminButton>
          </div>
        </div>
      )}

      <AdminTable>
        <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">Title</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {posts.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-muted">
                No posts yet.
              </td>
            </tr>
          )}
          {posts.map((post) =>
            editingId === post.id ? (
              <tr key={post.id}>
                <td colSpan={4} className="p-4">
                  <div className="grid gap-3">
                    <AdminField label="Title">
                      <input
                        className={adminInputClass}
                        value={editDraft.title}
                        onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                      />
                    </AdminField>
                    <AdminField label="Excerpt">
                      <textarea
                        rows={2}
                        className={adminInputClass}
                        value={editDraft.excerpt}
                        onChange={(e) => setEditDraft((d) => ({ ...d, excerpt: e.target.value }))}
                      />
                    </AdminField>
                    <AdminField label="Body (Markdown)">
                      <textarea
                        rows={8}
                        className={`${adminInputClass} font-mono`}
                        value={editDraft.body}
                        onChange={(e) => setEditDraft((d) => ({ ...d, body: e.target.value }))}
                      />
                    </AdminField>
                    <div className="flex gap-2">
                      <AdminButton variant="primary" onClick={() => saveEdit(post.id)} disabled={busy}>
                        Save changes
                      </AdminButton>
                      <AdminButton onClick={() => setEditingId(null)}>Cancel</AdminButton>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={post.id}>
                <td className="px-4 py-3 font-semibold">{post.title}</td>
                <td className="px-4 py-3">
                  <AdminTag variant={post.published ? "accent" : "neutral"}>
                    {post.published ? "Published" : "Draft"}
                  </AdminTag>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">
                  {new Date(post.published_at || post.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <AdminButton onClick={() => toggleStatus(post)} disabled={busy}>
                      {post.published ? "Unpublish" : "Publish"}
                    </AdminButton>
                    <AdminButton onClick={() => startEdit(post)}>Edit</AdminButton>
                    <AdminButton onClick={() => remove(post.id, post.title)} disabled={busy}>
                      Remove
                    </AdminButton>
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </AdminTable>
    </section>
  );
}
