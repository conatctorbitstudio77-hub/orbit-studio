"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  AdminButton,
  AdminField,
  AdminTag,
  BlueprintCard,
  SectionHeading,
  adminInputClass,
} from "@/components/admin/ui";
import { industries } from "@/lib/industries";
import { createClient } from "@/lib/supabase/client";
import type { CaseStudyRecord } from "@/lib/admin/types";

type Draft = {
  title: string;
  client: string;
  industry: string;
  summary: string;
  websiteUrl: string;
};

const emptyDraft: Draft = {
  title: "",
  client: "",
  industry: industries[0],
  summary: "",
  websiteUrl: "",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CaseStudiesSection({ caseStudies }: { caseStudies: CaseStudyRecord[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!draft.title.trim() || !draft.client.trim()) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("case_studies").insert({
      title: draft.title.trim(),
      slug: slugify(draft.title),
      industry: draft.industry,
      summary: draft.summary.trim() || `Case study for ${draft.client.trim()}.`,
      results: null,
      website_url: draft.websiteUrl.trim() || null,
      published: false,
      display_order: caseStudies.length,
    });
    setBusy(false);
    if (error) {
      console.error("[CaseStudiesSection] Failed to add case study:", error);
      window.alert(
        error.code === "23505" ? "That title/slug is already in use." : "Couldn't save — try again."
      );
      return;
    }
    setDraft(emptyDraft);
    setAdding(false);
    router.refresh();
  }

  function startEdit(cs: CaseStudyRecord) {
    setEditingId(cs.id);
    setEditDraft({
      title: cs.title,
      client: "",
      industry: cs.industry,
      summary: cs.summary,
      websiteUrl: cs.website_url ?? "",
    });
  }

  async function saveEdit(id: string) {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("case_studies")
      .update({
        title: editDraft.title.trim(),
        industry: editDraft.industry,
        summary: editDraft.summary.trim(),
        website_url: editDraft.websiteUrl.trim() || null,
      })
      .eq("id", id);
    setBusy(false);
    if (error) {
      console.error("[CaseStudiesSection] Failed to save edit:", error);
      window.alert("Couldn't save — try again.");
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function remove(id: string, title: string) {
    if (!window.confirm(`Remove "${title}"? This can't be undone.`)) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("case_studies").delete().eq("id", id);
    setBusy(false);
    if (error) {
      console.error("[CaseStudiesSection] Failed to remove case study:", error);
      window.alert("Couldn't remove — try again.");
      return;
    }
    router.refresh();
  }

  async function togglePublish(cs: CaseStudyRecord) {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("case_studies")
      .update({ published: !cs.published })
      .eq("id", cs.id);
    setBusy(false);
    if (error) {
      console.error("[CaseStudiesSection] Failed to toggle publish:", error);
      window.alert("Couldn't save — try again.");
      return;
    }
    router.refresh();
  }

  return (
    <section id="case-studies" className="mt-12 border-t border-border pb-2 pt-14">
      <SectionHeading
        kicker="Our work"
        title="Case studies"
        action={
          <AdminButton variant="primary" blueprint onClick={() => setAdding((v) => !v)}>
            {adding ? "Cancel" : "+ New case study"}
          </AdminButton>
        }
      />

      {adding && (
        <div className="relative mb-5 border border-border bg-accent/10 p-6">
          <div className="grid gap-3 md:grid-cols-3">
            <AdminField label="Title">
              <input
                className={adminInputClass}
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              />
            </AdminField>
            <AdminField label="Client">
              <input
                className={adminInputClass}
                value={draft.client}
                onChange={(e) => setDraft((d) => ({ ...d, client: e.target.value }))}
              />
            </AdminField>
            <AdminField label="Industry">
              <select
                className={adminInputClass}
                value={draft.industry}
                onChange={(e) => setDraft((d) => ({ ...d, industry: e.target.value }))}
              >
                {industries.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </AdminField>
          </div>
          <div className="mt-3">
            <AdminField label="Summary">
              <textarea
                rows={2}
                className={adminInputClass}
                value={draft.summary}
                onChange={(e) => setDraft((d) => ({ ...d, summary: e.target.value }))}
              />
            </AdminField>
          </div>
          <div className="mt-3">
            <AdminField label="Website URL">
              <input
                type="url"
                placeholder="https://client-site.com"
                className={adminInputClass}
                value={draft.websiteUrl}
                onChange={(e) => setDraft((d) => ({ ...d, websiteUrl: e.target.value }))}
              />
            </AdminField>
          </div>
          <div className="mt-4 flex gap-2">
            <AdminButton variant="primary" onClick={submit} disabled={busy}>
              Save case study
            </AdminButton>
            <AdminButton onClick={() => setAdding(false)}>Cancel</AdminButton>
          </div>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        {caseStudies.length === 0 && (
          <p className="text-sm text-muted">No case studies yet.</p>
        )}
        {caseStudies.map((cs) =>
          editingId === cs.id ? (
            <div key={cs.id} className="relative border border-border bg-accent/10 p-6">
              <div className="grid gap-3">
                <AdminField label="Title">
                  <input
                    className={adminInputClass}
                    value={editDraft.title}
                    onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                  />
                </AdminField>
                <AdminField label="Industry">
                  <select
                    className={adminInputClass}
                    value={editDraft.industry}
                    onChange={(e) => setEditDraft((d) => ({ ...d, industry: e.target.value }))}
                  >
                    {industries.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="Summary">
                  <textarea
                    rows={3}
                    className={adminInputClass}
                    value={editDraft.summary}
                    onChange={(e) => setEditDraft((d) => ({ ...d, summary: e.target.value }))}
                  />
                </AdminField>
                <AdminField label="Website URL">
                  <input
                    type="url"
                    placeholder="https://client-site.com"
                    className={adminInputClass}
                    value={editDraft.websiteUrl}
                    onChange={(e) => setEditDraft((d) => ({ ...d, websiteUrl: e.target.value }))}
                  />
                </AdminField>
              </div>
              <div className="mt-4 flex gap-2">
                <AdminButton variant="primary" onClick={() => saveEdit(cs.id)} disabled={busy}>
                  Save changes
                </AdminButton>
                <AdminButton onClick={() => setEditingId(null)}>Cancel</AdminButton>
              </div>
            </div>
          ) : (
            <BlueprintCard key={cs.id} className="flex flex-col">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-accent-text">
                {cs.industry}
              </span>
              <p className="font-display text-lg font-semibold">{cs.title}</p>
              <p className="mt-2 flex-1 text-sm text-muted">{cs.summary}</p>
              {cs.website_url && (
                <a
                  href={cs.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 self-start text-sm font-medium text-accent-text hover:underline"
                >
                  Visit site
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <AdminTag variant={cs.published ? "accent" : "neutral"}>
                  {cs.published ? "Published" : "Draft"}
                </AdminTag>
                <div className="flex gap-1">
                  <AdminButton onClick={() => togglePublish(cs)} disabled={busy}>
                    {cs.published ? "Unpublish" : "Publish"}
                  </AdminButton>
                  <AdminButton onClick={() => startEdit(cs)}>Edit</AdminButton>
                  <AdminButton onClick={() => remove(cs.id, cs.title)} disabled={busy}>
                    Remove
                  </AdminButton>
                </div>
              </div>
            </BlueprintCard>
          )
        )}
      </div>
    </section>
  );
}
