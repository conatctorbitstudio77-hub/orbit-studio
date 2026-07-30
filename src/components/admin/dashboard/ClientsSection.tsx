"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AdminButton,
  AdminField,
  AdminTable,
  AdminTag,
  SectionHeading,
  adminInputClass,
} from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/client";
import type { ClientRecord, SiteStatus } from "@/lib/admin/types";

const statusVariant: Record<SiteStatus, "accent" | "outline" | "neutral"> = {
  live: "accent",
  in_progress: "outline",
  planned: "neutral",
};

type Draft = {
  business: string;
  contact: string;
  industry: string;
  siteStatus: SiteStatus;
};

const emptyDraft: Draft = { business: "", contact: "", industry: "", siteStatus: "planned" };

export function ClientsSection({ clients }: { clients: ClientRecord[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!draft.business.trim()) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("clients").insert({
      business_name: draft.business.trim(),
      contact_name: draft.contact.trim() || null,
      industry: draft.industry.trim() || null,
      site_status: draft.siteStatus,
    });
    setBusy(false);
    if (error) {
      console.error("[ClientsSection] Failed to add client:", error);
      window.alert("Couldn't save — try again.");
      return;
    }
    setDraft(emptyDraft);
    setAdding(false);
    router.refresh();
  }

  async function updateStatus(id: string, siteStatus: SiteStatus) {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("clients").update({ site_status: siteStatus }).eq("id", id);
    setBusy(false);
    if (error) {
      console.error("[ClientsSection] Failed to update status:", error);
      window.alert("Couldn't save — try again.");
      return;
    }
    router.refresh();
  }

  async function remove(id: string, business: string) {
    if (!window.confirm(`Remove "${business}"? This can't be undone.`)) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("clients").delete().eq("id", id);
    setBusy(false);
    if (error) {
      console.error("[ClientsSection] Failed to remove client:", error);
      window.alert("Couldn't remove — try again.");
      return;
    }
    router.refresh();
  }

  return (
    <section id="clients" className="mt-12 border-t border-border pb-2 pt-14">
      <SectionHeading
        kicker="Businesses on the books"
        title="Clients"
        action={
          <AdminButton variant="primary" blueprint onClick={() => setAdding((v) => !v)}>
            {adding ? "Cancel" : "+ New client"}
          </AdminButton>
        }
      />

      {adding && (
        <div className="relative mb-5 border border-border bg-accent/10 p-6">
          <div className="grid gap-3 md:grid-cols-4">
            <AdminField label="Business">
              <input
                className={adminInputClass}
                value={draft.business}
                onChange={(e) => setDraft((d) => ({ ...d, business: e.target.value }))}
              />
            </AdminField>
            <AdminField label="Contact">
              <input
                className={adminInputClass}
                value={draft.contact}
                onChange={(e) => setDraft((d) => ({ ...d, contact: e.target.value }))}
              />
            </AdminField>
            <AdminField label="Industry">
              <input
                className={adminInputClass}
                value={draft.industry}
                onChange={(e) => setDraft((d) => ({ ...d, industry: e.target.value }))}
              />
            </AdminField>
            <AdminField label="Site status">
              <select
                className={adminInputClass}
                value={draft.siteStatus}
                onChange={(e) => setDraft((d) => ({ ...d, siteStatus: e.target.value as SiteStatus }))}
              >
                <option value="live">Live</option>
                <option value="in_progress">In progress</option>
                <option value="planned">Planned</option>
              </select>
            </AdminField>
          </div>
          <div className="mt-4 flex gap-2">
            <AdminButton variant="primary" onClick={submit} disabled={busy}>
              Save client
            </AdminButton>
            <AdminButton onClick={() => setAdding(false)}>Cancel</AdminButton>
          </div>
        </div>
      )}

      <AdminTable>
        <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">Business</th>
            <th className="px-4 py-3 font-semibold">Contact</th>
            <th className="px-4 py-3 font-semibold">Industry</th>
            <th className="px-4 py-3 font-semibold">Site status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {clients.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted">
                No clients yet — mark a quote &ldquo;Won&rdquo; and it&apos;ll show up here
                automatically.
              </td>
            </tr>
          )}
          {clients.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-3 font-semibold">
                <div className="flex items-center gap-2">
                  {c.business_name}
                  {c.quote_id && <AdminTag variant="outline">from quote</AdminTag>}
                </div>
              </td>
              <td className="px-4 py-3">{c.contact_name || "—"}</td>
              <td className="px-4 py-3">{c.industry || "—"}</td>
              <td className="px-4 py-3">
                <select
                  disabled={busy}
                  value={c.site_status}
                  onChange={(e) => updateStatus(c.id, e.target.value as SiteStatus)}
                  className={`min-w-[130px] border px-2.5 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                    statusVariant[c.site_status] === "accent"
                      ? "border-accent bg-accent/10 text-accent-text font-semibold"
                      : "border-border bg-surface-muted text-foreground"
                  }`}
                >
                  <option value="live">Live</option>
                  <option value="in_progress">In progress</option>
                  <option value="planned">Planned</option>
                </select>
              </td>
              <td className="px-4 py-3 text-right">
                <AdminButton onClick={() => remove(c.id, c.business_name)} disabled={busy}>
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
