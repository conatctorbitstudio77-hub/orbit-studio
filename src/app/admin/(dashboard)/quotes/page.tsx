import type { Metadata } from "next";
import Link from "next/link";
import { QuoteStatusSelect } from "@/components/admin/QuoteStatusSelect";
import { createClient } from "@/lib/supabase/server";
import type { Quote } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quotes — Admin",
  robots: { index: false, follow: false },
};

type QuoteListRow = Pick<
  Quote,
  | "id"
  | "created_at"
  | "status"
  | "full_name"
  | "business_name"
  | "industry"
  | "package_interested"
>;

export default async function AdminQuotesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(
      "id, created_at, status, full_name, business_name, industry, package_interested"
    )
    .order("created_at", { ascending: false })
    .returns<QuoteListRow[]>();

  if (error) console.error("[admin/quotes] Failed to load quotes:", error);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-2xl font-semibold">Quotes</h1>
        {data && <p className="text-sm text-muted">{data.length} total</p>}
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent-text">
          Couldn&apos;t load quotes: {error.message}
        </div>
      )}

      {!error && (!data || data.length === 0) && (
        <div className="mt-6 rounded-xl border border-border bg-surface px-4 py-8 text-center text-sm text-muted">
          No quote requests yet — they&apos;ll show up here as soon as
          someone submits the form.
        </div>
      )}

      {!error && data && data.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Business</th>
                <th className="px-4 py-3 font-medium">Industry</th>
                <th className="px-4 py-3 font-medium">Package</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {data.map((quote) => (
                <tr key={quote.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/quotes/${quote.id}`}
                      className="font-medium transition-colors hover:text-accent-text"
                    >
                      {quote.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {quote.business_name}
                  </td>
                  <td className="px-4 py-3 text-muted">{quote.industry}</td>
                  <td className="px-4 py-3 text-muted">
                    {quote.package_interested || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {new Date(quote.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <QuoteStatusSelect id={quote.id} status={quote.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
