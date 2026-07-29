import type { Metadata } from "next";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { ReorderButtons } from "@/components/admin/ReorderButtons";
import { createClient } from "@/lib/supabase/server";
import type { CaseStudyRecord } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Case Studies — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminCaseStudiesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_studies")
    .select("*")
    .order("display_order", { ascending: true })
    .returns<CaseStudyRecord[]>();

  if (error) console.error("[admin/case-studies] Failed to load case studies:", error);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Case Studies</h1>
        <Link
          href="/admin/case-studies/new"
          className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-ink transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30"
        >
          New case study
        </Link>
      </div>

      <p className="mt-2 text-sm text-muted">
        When zero case studies are published, the public /work page falls
        back to the &ldquo;coming soon&rdquo; placeholder cards automatically.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent-text">
          Couldn&apos;t load case studies: {error.message}
        </div>
      )}

      {!error && (!data || data.length === 0) && (
        <div className="mt-6 rounded-xl border border-border bg-surface px-4 py-8 text-center text-sm text-muted">
          No case studies yet.
        </div>
      )}

      {!error && data && data.length > 0 && (
        <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
          {data.map((cs, i) => (
            <div
              key={cs.id}
              className="flex flex-wrap items-center justify-between gap-4 px-4 py-4"
            >
              <div className="flex items-center gap-3">
                <ReorderButtons
                  id={cs.id}
                  order={cs.display_order}
                  prev={i > 0 ? { id: data[i - 1].id, display_order: data[i - 1].display_order } : null}
                  next={i < data.length - 1 ? { id: data[i + 1].id, display_order: data[i + 1].display_order } : null}
                />
                <div>
                  <p className="font-medium">{cs.title}</p>
                  <p className="text-xs text-muted">
                    {cs.industry} · /work/{cs.slug}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <PublishToggle table="case_studies" id={cs.id} published={cs.published} />
                <Link
                  href={`/admin/case-studies/${cs.id}`}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  Edit
                </Link>
                <DeleteButton table="case_studies" id={cs.id} label={cs.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
