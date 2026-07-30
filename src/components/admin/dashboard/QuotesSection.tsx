"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AdminButton,
  AdminField,
  AdminTable,
  SectionHeading,
  adminInputClass,
} from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/client";
import type { Quote, QuoteStatus } from "@/lib/admin/types";

const statuses: QuoteStatus[] = ["new", "contacted", "won", "lost"];

const statusSelectClass: Record<QuoteStatus, string> = {
  won: "border-accent bg-accent/10 text-accent-text font-semibold",
  contacted: "border-border bg-surface-muted text-foreground",
  new: "border-border bg-surface-muted text-foreground",
  lost: "border-border bg-surface-muted text-muted",
};

type Draft = {
  name: string;
  business: string;
  industry: string;
  pkg: string;
  status: QuoteStatus;
};

const emptyDraft: Draft = { name: "", business: "", industry: "", pkg: "", status: "new" };

export function QuotesSection({ quotes }: { quotes: Quote[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function saveStatus(id: string, status: QuoteStatus) {
    setBusyId(id);
    const supabase = createClient();
    const { error } = await supabase.from("quotes").update({ status }).eq("id", id);
    setBusyId(null);
    if (error) {
      console.error("[QuotesSection] Failed to update status:", error);
      window.alert("Couldn't save — try again.");
      return;
    }
    router.refresh();
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this quote? This can't be undone.")) return;
    setBusyId(id);
    const supabase = createClient();
    const { error } = await supabase.from("quotes").delete().eq("id", id);
    setBusyId(null);
    if (error) {
      console.error("[QuotesSection] Failed to remove quote:", error);
      window.alert("Couldn't remove — try again.");
      return;
    }
    router.refresh();
  }

  async function submit() {
    if (!draft.name.trim() && !draft.business.trim()) return;
    const supabase = createClient();
    const { error } = await supabase.from("quotes").insert({
      full_name: draft.name.trim(),
      business_name: draft.business.trim(),
      industry: draft.industry.trim() || "Other",
      package_interested: draft.pkg.trim() || null,
      status: draft.status,
      email: "manually-added@orbitstudio.local",
    });
    if (error) {
      console.error("[QuotesSection] Failed to add quote:", error);
      window.alert("Couldn't add that quote — try again.");
      return;
    }
    setDraft(emptyDraft);
    setAdding(false);
    router.refresh();
  }

  return (
    <section id="quotes" className="mt-12 border-t border-border pb-2 pt-14">
      <SectionHeading
        kicker="Leads & requests"
        title="Quotes"
        action={
          <AdminButton variant="primary" blueprint onClick={() => setAdding((v) => !v)}>
            {adding ? "Cancel" : "+ New quote"}
          </AdminButton>
        }
      />

      {adding && (
        <div className="relative mb-5 border border-border bg-accent/10 p-6">
          <div className="grid gap-3 md:grid-cols-5">
            <AdminField label="Name">
              <input
                className={adminInputClass}
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </AdminField>
            <AdminField label="Business">
              <input
                className={adminInputClass}
                value={draft.business}
                onChange={(e) => setDraft((d) => ({ ...d, business: e.target.value }))}
              />
            </AdminField>
            <AdminField label="Industry">
              <input
                className={adminInputClass}
                value={draft.industry}
                onChange={(e) => setDraft((d) => ({ ...d, industry: e.target.value }))}
              />
            </AdminField>
            <AdminField label="Package">
              <input
                className={adminInputClass}
                value={draft.pkg}
                onChange={(e) => setDraft((d) => ({ ...d, pkg: e.target.value }))}
              />
            </AdminField>
            <AdminField label="Status">
              <select
                className={adminInputClass}
                value={draft.status}
                onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as QuoteStatus }))}
              >
                {statuses.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>
            </AdminField>
          </div>
          <div className="mt-4 flex gap-2">
            <AdminButton variant="primary" onClick={submit}>
              Save quote
            </AdminButton>
            <AdminButton onClick={() => setAdding(false)}>Cancel</AdminButton>
          </div>
        </div>
      )}

      <AdminTable>
        <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Business</th>
            <th className="px-4 py-3 font-semibold">Industry</th>
            <th className="px-4 py-3 font-semibold">Package</th>
            <th className="px-4 py-3 font-semibold">Submitted</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {quotes.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-muted">
                No quote requests yet.
              </td>
            </tr>
          )}
          {quotes.map((q) => (
            <tr key={q.id}>
              <td className="px-4 py-3 font-semibold">{q.full_name}</td>
              <td className="px-4 py-3">{q.business_name}</td>
              <td className="px-4 py-3">{q.industry}</td>
              <td className="px-4 py-3">{q.package_interested || "—"}</td>
              <td className="px-4 py-3 whitespace-nowrap text-muted">
                {new Date(q.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <select
                  disabled={busyId === q.id}
                  value={q.status}
                  onChange={(e) => saveStatus(q.id, e.target.value as QuoteStatus)}
                  className={`min-w-[130px] border px-2.5 py-1.5 text-xs font-medium capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-60 ${statusSelectClass[q.status]}`}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-right">
                <AdminButton onClick={() => remove(q.id)} disabled={busyId === q.id}>
                  Remove
                </AdminButton>
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </section>
  );
}
