import type { Metadata } from "next";
import Link from "next/link";
import { CaseStudyForm } from "@/components/admin/CaseStudyForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Case Study — Admin",
  robots: { index: false, follow: false },
};

export default async function NewCaseStudyPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("case_studies")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .returns<{ display_order: number }[]>();

  const nextDisplayOrder = (data?.[0]?.display_order ?? -1) + 1;

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/case-studies"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Back to case studies
      </Link>
      <h1 className="mt-4 mb-6 font-display text-2xl font-semibold">
        New case study
      </h1>
      <CaseStudyForm nextDisplayOrder={nextDisplayOrder} />
    </div>
  );
}
