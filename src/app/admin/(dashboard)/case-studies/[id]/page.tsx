import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudyForm } from "@/components/admin/CaseStudyForm";
import { createClient } from "@/lib/supabase/server";
import type { CaseStudyRecord } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Case Study — Admin",
  robots: { index: false, follow: false },
};

export default async function EditCaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: caseStudy, error } = await supabase
    .from("case_studies")
    .select("*")
    .eq("id", id)
    .single<CaseStudyRecord>();

  if (error || !caseStudy) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/case-studies"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Back to case studies
      </Link>
      <h1 className="mt-4 mb-6 font-display text-2xl font-semibold">
        Edit case study
      </h1>
      <CaseStudyForm initial={caseStudy} />
    </div>
  );
}
