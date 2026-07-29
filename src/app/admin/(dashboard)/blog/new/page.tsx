import type { Metadata } from "next";
import Link from "next/link";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export const metadata: Metadata = {
  title: "New Post — Admin",
  robots: { index: false, follow: false },
};

export default function NewBlogPostPage() {
  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/blog"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Back to blog
      </Link>
      <h1 className="mt-4 mb-6 font-display text-2xl font-semibold">
        New post
      </h1>
      <BlogPostForm />
    </div>
  );
}
