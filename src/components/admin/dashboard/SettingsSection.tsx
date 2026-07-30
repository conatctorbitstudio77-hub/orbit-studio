"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AdminButton,
  AdminField,
  AdminTag,
  BlueprintCard,
  Kicker,
  adminInputClass,
} from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/client";
import type {
  FaqRecord,
  PricingTierKind,
  PricingTierRecord,
  SiteSettingsRecord,
} from "@/lib/admin/types";

type TierDraft = Omit<PricingTierRecord, "created_at" | "display_order"> & { isNew?: boolean };
type FaqDraft = Omit<FaqRecord, "created_at" | "display_order"> & { isNew?: boolean };

function tempId() {
  return `new-${Math.random().toString(36).slice(2)}`;
}

export function SettingsSection({
  settings,
  pricingTiers,
  faqs,
}: {
  settings: SiteSettingsRecord | null;
  pricingTiers: PricingTierRecord[];
  faqs: FaqRecord[];
}) {
  const router = useRouter();
  const [heroTitle, setHeroTitle] = useState(settings?.hero_title || "");
  const [heroSubtitle, setHeroSubtitle] = useState(settings?.hero_subtitle || "");
  const [tiers, setTiers] = useState<TierDraft[]>(pricingTiers);
  const [faqDrafts, setFaqDrafts] = useState<FaqDraft[]>(faqs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function markDirty() {
    setSaved(false);
  }

  function updateTier(id: string, patch: Partial<TierDraft>) {
    setTiers((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    markDirty();
  }

  function addTier(kind: PricingTierKind) {
    setTiers((list) => [
      ...list,
      {
        id: tempId(),
        kind,
        name: "New package",
        tagline: "",
        price: "$0",
        billing_label: kind === "one-time" ? "one-time" : "/month",
        best_for: "",
        includes: [],
        featured: false,
        isNew: true,
      },
    ]);
    markDirty();
  }

  function removeTier(id: string) {
    setTiers((list) => list.filter((t) => t.id !== id));
    markDirty();
  }

  function addFaq() {
    setFaqDrafts((list) => [...list, { id: tempId(), question: "", answer: "", isNew: true }]);
    markDirty();
  }
  function updateFaq(id: string, patch: Partial<FaqDraft>) {
    setFaqDrafts((list) => list.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    markDirty();
  }
  function removeFaq(id: string) {
    setFaqDrafts((list) => list.filter((f) => f.id !== id));
    markDirty();
  }

  async function saveAll() {
    setSaving(true);
    const supabase = createClient();

    try {
      const { error: settingsError } = await supabase
        .from("site_settings")
        .update({ hero_title: heroTitle, hero_subtitle: heroSubtitle, updated_at: new Date().toISOString() })
        .eq("id", true);
      if (settingsError) throw settingsError;

      const removedTiers = pricingTiers.filter((t) => !tiers.find((x) => x.id === t.id));
      if (removedTiers.length) {
        const { error } = await supabase.from("pricing_tiers").delete().in("id", removedTiers.map((t) => t.id));
        if (error) throw error;
      }
      for (const [index, tier] of tiers.entries()) {
        const row = {
          kind: tier.kind,
          name: tier.name.trim(),
          tagline: tier.tagline?.trim() || null,
          price: tier.price.trim(),
          billing_label: tier.billing_label.trim(),
          best_for: tier.best_for?.trim() || null,
          includes: tier.includes,
          featured: tier.featured,
          display_order: index,
        };
        if (tier.isNew) {
          const { error } = await supabase.from("pricing_tiers").insert(row);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("pricing_tiers").update(row).eq("id", tier.id);
          if (error) throw error;
        }
      }

      const removedFaqs = faqs.filter((f) => !faqDrafts.find((x) => x.id === f.id));
      if (removedFaqs.length) {
        const { error } = await supabase.from("faqs").delete().in("id", removedFaqs.map((f) => f.id));
        if (error) throw error;
      }
      for (const [index, faq] of faqDrafts.entries()) {
        const row = { question: faq.question.trim(), answer: faq.answer.trim(), display_order: index };
        if (faq.isNew) {
          const { error } = await supabase.from("faqs").insert(row);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("faqs").update(row).eq("id", faq.id);
          if (error) throw error;
        }
      }

      setSaved(true);
      router.refresh();
    } catch (error) {
      console.error("[SettingsSection] Failed to save settings:", error);
      window.alert("Couldn't save everything — check the console and try again.");
    } finally {
      setSaving(false);
    }
  }

  const oneTimeTiers = tiers.filter((t) => t.kind === "one-time");
  const monthlyTiers = tiers.filter((t) => t.kind === "monthly");

  return (
    <section id="settings" className="mt-12 border-t border-border pb-2 pt-14">
      <Kicker>Site settings</Kicker>
      <h2 className="mb-5 font-display text-2xl font-semibold uppercase tracking-wide">
        Content &amp; pricing
      </h2>

      <div className="mb-8 grid gap-4 md:grid-cols-[2fr_1fr]">
        <AdminField label="Homepage hero title">
          <input
            className={adminInputClass}
            value={heroTitle}
            onChange={(e) => {
              setHeroTitle(e.target.value);
              markDirty();
            }}
          />
        </AdminField>
        <AdminField label="Homepage hero subtitle">
          <input
            className={adminInputClass}
            value={heroSubtitle}
            onChange={(e) => {
              setHeroSubtitle(e.target.value);
              markDirty();
            }}
          />
        </AdminField>
      </div>

      <PricingGroup
        label="One-Time packages"
        kind="one-time"
        tiers={oneTimeTiers}
        onAdd={() => addTier("one-time")}
        onUpdate={updateTier}
        onRemove={removeTier}
      />
      <PricingGroup
        label="Monthly plans"
        kind="monthly"
        tiers={monthlyTiers}
        onAdd={() => addTier("monthly")}
        onUpdate={updateTier}
        onRemove={removeTier}
      />

      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-accent-text">FAQ</div>
        <AdminButton onClick={addFaq}>+ Add question</AdminButton>
      </div>
      <div className="mb-8 grid gap-3">
        {faqDrafts.map((faq) => (
          <BlueprintCard key={faq.id}>
            <div className="grid items-end gap-3 md:grid-cols-[1fr_auto]">
              <AdminField label="Question">
                <input
                  className={adminInputClass}
                  value={faq.question}
                  onChange={(e) => updateFaq(faq.id, { question: e.target.value })}
                />
              </AdminField>
              <AdminButton onClick={() => removeFaq(faq.id)}>Remove</AdminButton>
            </div>
            <div className="mt-2">
              <AdminField label="Answer">
                <textarea
                  rows={2}
                  className={adminInputClass}
                  value={faq.answer}
                  onChange={(e) => updateFaq(faq.id, { answer: e.target.value })}
                />
              </AdminField>
            </div>
          </BlueprintCard>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <AdminButton variant="primary" blueprint onClick={saveAll} disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </AdminButton>
        {saved && <AdminTag variant="accent">Saved</AdminTag>}
      </div>
    </section>
  );
}

function PricingGroup({
  label,
  kind,
  tiers,
  onAdd,
  onUpdate,
  onRemove,
}: {
  label: string;
  kind: PricingTierKind;
  tiers: TierDraft[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<TierDraft>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-accent-text">{label}</div>
        <AdminButton onClick={onAdd}>+ Add package</AdminButton>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {tiers.length === 0 && (
          <p className="text-sm text-muted">No {kind === "one-time" ? "one-time packages" : "monthly plans"} yet.</p>
        )}
        {tiers.map((tier) => (
          <BlueprintCard key={tier.id}>
            <div className="flex items-end justify-between gap-2">
              <div className="flex-1">
                <AdminField label="Name">
                  <input
                    className={adminInputClass}
                    value={tier.name}
                    onChange={(e) => onUpdate(tier.id, { name: e.target.value })}
                  />
                </AdminField>
              </div>
              <AdminButton onClick={() => onRemove(tier.id)}>Remove</AdminButton>
            </div>
            <div className="mt-2">
              <AdminField label="Tagline">
                <input
                  className={adminInputClass}
                  value={tier.tagline || ""}
                  onChange={(e) => onUpdate(tier.id, { tagline: e.target.value })}
                />
              </AdminField>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <AdminField label="Price">
                <input
                  className={adminInputClass}
                  value={tier.price}
                  onChange={(e) => onUpdate(tier.id, { price: e.target.value })}
                />
              </AdminField>
              <AdminField label="Billing label">
                <input
                  className={adminInputClass}
                  value={tier.billing_label}
                  onChange={(e) => onUpdate(tier.id, { billing_label: e.target.value })}
                />
              </AdminField>
            </div>
            <div className="mt-2">
              <AdminField label="Best for">
                <input
                  className={adminInputClass}
                  value={tier.best_for || ""}
                  onChange={(e) => onUpdate(tier.id, { best_for: e.target.value })}
                />
              </AdminField>
            </div>
            <div className="mt-2">
              <AdminField label="Includes (one per line)">
                <textarea
                  rows={4}
                  className={adminInputClass}
                  value={tier.includes.join("\n")}
                  onChange={(e) =>
                    onUpdate(tier.id, { includes: e.target.value.split("\n").filter((line) => line.trim()) })
                  }
                />
              </AdminField>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-accent"
                checked={tier.featured}
                onChange={(e) => onUpdate(tier.id, { featured: e.target.checked })}
              />
              Featured / most popular
            </label>
          </BlueprintCard>
        ))}
      </div>
    </div>
  );
}
