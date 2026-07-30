import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { Eyebrow, Section } from "@/components/Section";
import { Reveal } from "@/components/motion/Reveal";
import { createPublicClient } from "@/lib/supabase/public";
import type { BlogPostRecord } from "@/lib/admin/types";

// Posts are admin-editable in Supabase — render dynamically so publishing
// a post shows immediately instead of waiting for the next deploy.
export const dynamic = "force-dynamic";

async function getPost(slug: string): Promise<BlogPostRecord | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single<BlogPostRecord>();

    if (error || !data) return null;
    return data;
  } catch (error) {
    console.error("[blog/[slug]] Failed to load post:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const html = await marked.parse(post.body);

  return (
    <Section className="pt-16">
      <Reveal>
        <Link
          href="/blog"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Back to resources
        </Link>

        <Eyebrow>Resources</Eyebrow>
        <h1 className="max-w-2xl text-balance font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {post.title}
        </h1>
        {post.published_at && (
          <p className="mt-4 text-sm text-muted">
            {new Date(post.published_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </Reveal>

      <Reveal delay={0.08}>
        <div
          className="prose mt-10 max-w-none"
          // Admin-authored content only (single trusted owner account) — not
          // rendering arbitrary public/user-submitted input.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Reveal>
    </Section>
  );
}
