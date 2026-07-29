import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuoteStatusSelect } from "@/components/admin/QuoteStatusSelect";
import { createClient } from "@/lib/supabase/server";
import type { Quote } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quote Detail — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: quote, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .single<Quote>();

  if (error || !quote) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/quotes"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Back to quotes
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            {quote.full_name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {quote.business_name} — submitted{" "}
            {new Date(quote.created_at).toLocaleString()}
          </p>
        </div>
        <QuoteStatusSelect id={quote.id} status={quote.status} />
      </div>

      <div className="mt-8 divide-y divide-border rounded-xl border border-border bg-surface">
        <Row label="Email" value={quote.email} />
        <Row label="Phone" value={quote.phone} />
        <Row label="Industry" value={quote.industry} />
        <Row
          label="Has a website?"
          value={quote.has_website === "yes" ? "Yes" : quote.has_website === "no" ? "No, starting fresh" : null}
        />
        <Row label="Current website" value={quote.current_website} />
        <Row label="Competitor / inspiration" value={quote.competitor_url} />
        <Row label="Package interested" value={quote.package_interested} />
        <Row label="Timeline" value={quote.timeline} />
        <Row
          label="Features wanted"
          value={quote.features?.length ? quote.features.join(", ") : null}
        />
        <Row label="Content ready?" value={quote.content_ready} />
      </div>

      {quote.additional_notes && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Notes
          </p>
          <p className="mt-2 text-sm">{quote.additional_notes}</p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 px-4 py-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
