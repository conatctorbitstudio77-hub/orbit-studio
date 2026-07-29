import type { Metadata } from "next";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { createClient } from "@/lib/supabase/server";
import type { BlogPostRecord } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<BlogPostRecord[]>();

  if (error) console.error("[admin/blog] Failed to load posts:", error);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Blog</h1>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-ink transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30"
        >
          New post
        </Link>
      </div>

      <p className="mt-2 text-sm text-muted">
        When zero posts are published, the public /blog page falls back to
        the &ldquo;coming soon&rdquo; stub cards automatically.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent-text">
          Couldn&apos;t load posts: {error.message}
        </div>
      )}

      {!error && (!data || data.length === 0) && (
        <div className="mt-6 rounded-xl border border-border bg-surface px-4 py-8 text-center text-sm text-muted">
          No posts yet.
        </div>
      )}

      {!error && data && data.length > 0 && (
        <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
          {data.map((post) => (
            <div
              key={post.id}
              className="flex flex-wrap items-center justify-between gap-4 px-4 py-4"
            >
              <div>
                <p className="font-medium">{post.title}</p>
                <p className="text-xs text-muted">/blog/{post.slug}</p>
              </div>

              <div className="flex items-center gap-4">
                <PublishToggle table="blog_posts" id={post.id} published={post.published} />
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  Edit
                </Link>
                <DeleteButton table="blog_posts" id={post.id} label={post.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
