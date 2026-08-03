import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { Eyebrow, Section } from "@/components/Section";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { blogPosts as placeholderPosts } from "@/lib/blog";
import { createPublicClient } from "@/lib/supabase/public";
import type { BlogPostRecord } from "@/lib/admin/types";

export const metadata: Metadata = {
  title: "Resources & Blog",
  description:
    "Practical guides on getting found online and booking more jobs — written for local service business owners, not marketers.",
};

/**
 * Fetches published posts from Supabase. Falls back to the static
 * "coming soon" stubs on any failure, same pattern as /work.
 */
async function getPosts(): Promise<BlogPostRecord[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("blog-posts");

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .returns<BlogPostRecord[]>();

    if (error || !data) return [];
    return data;
  } catch (error) {
    console.error("[blog] Falling back to placeholder posts:", error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();
  const hasRealPosts = posts.length > 0;

  return (
    <>
      <Section className="border-b border-border pt-16">
        <Reveal>
          <Eyebrow>Resources</Eyebrow>
          <h1 className="max-w-2xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Straight answers, no marketing jargon.
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Guides for local service business owners on getting found
            online, booking more jobs, and knowing what&apos;s actually
            worth paying for.
          </p>
        </Reveal>
      </Section>

      <Section>
        {hasRealPosts ? (
          <RevealGroup className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <RevealItem key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-all duration-200 ease-out hover:-translate-y-1 hover:border-accent/60 hover:shadow-lg"
                >
                  <p className="mt-3 font-display text-lg font-medium">
                    {post.title}
                  </p>
                  <p className="mt-2 flex-1 text-sm text-muted">
                    {post.excerpt}
                  </p>
                  <p className="mt-4 text-sm text-accent-text transition-colors group-hover:text-accent">
                    Read more →
                  </p>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <RevealGroup className="grid gap-6 md:grid-cols-2">
            {placeholderPosts.map((post) => (
              <RevealItem key={post.slug}>
                <div className="h-full rounded-2xl border border-border bg-surface p-6">
                  <p className="text-xs font-medium uppercase tracking-widest text-accent-text">
                    Coming soon
                  </p>
                  <p className="mt-3 font-display text-lg font-medium">
                    {post.title}
                  </p>
                  <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </Section>
    </>
  );
}
