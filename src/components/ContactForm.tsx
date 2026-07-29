"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { industries } from "@/lib/industries";
import { site, tiers } from "@/lib/site";

const timelines = [
  "ASAP",
  "Within 1 month",
  "1–3 months",
  "Just exploring",
];

const featureOptions = [
  "Online booking / inquiry form",
  "Photo or project gallery",
  "Multiple service-area pages",
  "Blog / content section",
  "Customer reviews integration",
  "Something else",
];

const contentReadiness = [
  "Photos & info ready to go",
  "Need help pulling it together",
  "Not sure yet",
];

type FormData = {
  name: string;
  business: string;
  email: string;
  phone: string;
  industry: string;
  hasWebsite: "yes" | "no" | "";
  currentWebsite: string;
  competitorUrl: string;
  packageInterest: string;
  timeline: string;
  features: string[];
  contentReady: string;
  message: string;
};

const emptyForm: FormData = {
  name: "",
  business: "",
  email: "",
  phone: "",
  industry: "",
  hasWebsite: "",
  currentWebsite: "",
  competitorUrl: "",
  packageInterest: "",
  timeline: "",
  features: [],
  contentReady: "",
  message: "",
};

const STEP_COUNT = 4;
const stepTitles = [
  "About you",
  "About your business",
  "Project details",
  "Anything else?",
];

export function ContactForm() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function toggleFeature(feature: string) {
    setData((d) => ({
      ...d,
      features: d.features.includes(feature)
        ? d.features.filter((f) => f !== feature)
        : [...d.features, feature],
    }));
  }

  function next() {
    if (step === 1 && (!data.name || !data.business || !data.email)) {
      setError("Please fill in your name, business name, and email.");
      return;
    }
    if (step === 2 && !data.industry) {
      setError("Please select your trade.");
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, STEP_COUNT));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="font-display text-lg font-medium">
          {`Thanks${data.name ? `, ${data.name.split(" ")[0]}` : ""} — that's in.`}
        </p>
        <p className="mt-2 text-sm text-muted">
          We reply to every quote request within one business day with a
          firm price based on what you told us. In the meantime, feel free
          to email {site.email} directly.
        </p>
      </div>
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Something went wrong. Please try again.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again or email us directly."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-surface p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            Step {step} of {STEP_COUNT}
          </span>
          <span>{stepTitles[step - 1]}</span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-muted">
          <motion.div
            className="h-full rounded-full bg-accent"
            initial={false}
            animate={{ width: `${(step / STEP_COUNT) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="grid gap-5"
        >
          {step === 1 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Name"
                  name="name"
                  value={data.name}
                  onChange={(v) => update("name", v)}
                  required
                />
                <Field
                  label="Business name"
                  name="business"
                  value={data.business}
                  onChange={(v) => update("business", v)}
                  required
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  value={data.email}
                  onChange={(v) => update("email", v)}
                  required
                />
                <Field
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={data.phone}
                  onChange={(v) => update("phone", v)}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-muted">Industry</span>
                <select
                  name="industry"
                  required
                  value={data.industry}
                  onChange={(e) => update("industry", e.target.value)}
                  className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  <option value="" disabled>
                    Select your trade
                  </option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-2 text-sm">
                <span className="text-muted">Do you have a website already?</span>
                <PillGroup
                  options={["yes", "no"]}
                  labels={{ yes: "Yes", no: "No, starting fresh" }}
                  value={data.hasWebsite}
                  onChange={(v) => update("hasWebsite", v as "yes" | "no")}
                />
              </div>

              <AnimatePresence initial={false}>
                {data.hasWebsite === "yes" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <Field
                      label="Current website URL"
                      name="currentWebsite"
                      value={data.currentWebsite}
                      onChange={(v) => update("currentWebsite", v)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Field
                label="Competitor or inspiration site (optional)"
                name="competitorUrl"
                value={data.competitorUrl}
                onChange={(v) => update("competitorUrl", v)}
                helper="A site whose look you like, even if it's a competitor's — helps us understand direction."
              />
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex flex-col gap-2 text-sm">
                <span className="text-muted">Which package interests you?</span>
                <PillGroup
                  options={[...tiers.map((t) => t.name), "Not sure yet"]}
                  value={data.packageInterest}
                  onChange={(v) => update("packageInterest", v)}
                />
              </div>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-muted">When do you need this live?</span>
                <select
                  name="timeline"
                  value={data.timeline}
                  onChange={(e) => update("timeline", e.target.value)}
                  className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  <option value="" disabled>
                    Select a timeline
                  </option>
                  {timelines.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-2 text-sm">
                <span className="text-muted">
                  What do you need on the site? (select all that apply)
                </span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {featureOptions.map((feature) => (
                    <label
                      key={feature}
                      className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-sm text-muted transition-colors has-checked:border-accent has-checked:text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={data.features.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                        className="h-4 w-4 accent-accent"
                      />
                      {feature}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 text-sm">
                <span className="text-muted">Is your content ready?</span>
                <PillGroup
                  options={contentReadiness}
                  value={data.contentReady}
                  onChange={(v) => update("contentReady", v)}
                />
              </div>
            </>
          )}

          {step === 4 && (
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-muted">
                What&apos;s going on with your current site, or anything else
                we should know?
              </span>
              <textarea
                name="message"
                rows={6}
                value={data.message}
                onChange={(e) => update("message", e.target.value)}
                className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </label>
          )}
        </motion.div>
      </AnimatePresence>

      {error && <p className="mt-4 text-sm text-accent">{error}</p>}

      <div className="mt-8 flex items-center justify-between gap-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={back}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-accent hover:text-accent-text disabled:pointer-events-none disabled:opacity-60"
          >
            Back
          </button>
        ) : (
          <span />
        )}

        {step < STEP_COUNT ? (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-ink transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-lg hover:shadow-accent/30 active:scale-95"
          >
            Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-ink transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-lg hover:shadow-accent/30 active:scale-95 disabled:pointer-events-none disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send my quote request"}
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  value,
  onChange,
  helper,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="text-muted">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      {helper && <span className="text-xs text-muted">{helper}</span>}
    </label>
  );
}

function PillGroup({
  options,
  labels,
  value,
  onChange,
}: {
  options: string[];
  labels?: Record<string, string>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-full border px-4 py-2 text-sm transition-all duration-200 ease-out ${
            value === option
              ? "border-accent bg-accent text-ink"
              : "border-border text-muted hover:border-accent/60 hover:text-foreground"
          }`}
        >
          {labels?.[option] ?? option}
        </button>
      ))}
    </div>
  );
}
