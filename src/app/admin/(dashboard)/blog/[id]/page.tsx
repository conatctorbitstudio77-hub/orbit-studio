import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { createClient } from "@/lib/supabase/server";
import type { BlogPostRecord } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Post — Admin",
  robots: { index: false, follow: false },
};

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single<BlogPostRecord>();

  if (error || !post) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/blog"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Back to blog
      </Link>
      <h1 className="mt-4 mb-6 font-display text-2xl font-semibold">
        Edit post
      </h1>
      <BlogPostForm initial={post} />
    </div>
  );
}
