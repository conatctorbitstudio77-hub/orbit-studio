import type { ButtonHTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";

/**
 * Shared "blueprint" building blocks for the admin dashboard — square
 * corners, hairline borders, corner registration marks. Visually distinct
 * from the public site's rounded cards on purpose (internal tool), but
 * built entirely from our own color tokens (ink/accent/deep-blue) and
 * type system (Space Grotesk/Inter) — never the design reference's own
 * cream palette or Barlow fonts.
 */

export const adminInputClass =
  "w-full border border-border bg-surface-muted px-3 py-2 text-sm text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

export function CornerMarks({ variant = "accent" }: { variant?: "accent" | "border" }) {
  const color = variant === "accent" ? "border-accent/50" : "border-border";
  const base = `pointer-events-none absolute h-2 w-2 ${color}`;
  return (
    <>
      <span className={`${base} left-0 top-0 border-l border-t`} />
      <span className={`${base} right-0 top-0 border-r border-t`} />
      <span className={`${base} bottom-0 left-0 border-b border-l`} />
      <span className={`${base} bottom-0 right-0 border-b border-r`} />
    </>
  );
}

export function BlueprintCard({
  children,
  className = "",
  tinted = false,
}: {
  children: ReactNode;
  className?: string;
  tinted?: boolean;
}) {
  return (
    <div
      className={`relative border border-border p-6 ${tinted ? "bg-accent/10" : "bg-surface"} ${className}`}
    >
      <CornerMarks />
      {children}
    </div>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-accent-text">
      {children}
    </span>
  );
}

export function SectionHeading({
  kicker,
  title,
  action,
}: {
  kicker: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <Kicker>{kicker}</Kicker>
        <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

type TagVariant = "accent" | "neutral" | "outline";

export function AdminTag({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: TagVariant;
}) {
  const styles: Record<TagVariant, string> = {
    accent: "border-accent bg-accent/10 text-accent-text",
    neutral: "border-border bg-surface-muted text-muted",
    outline: "border-border text-muted",
  };
  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

export function AdminField({
  label,
  children,
  ...rest
}: { label: string; children: ReactNode } & LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm" {...rest}>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
  blueprint?: boolean;
};

export function AdminButton({
  variant = "ghost",
  blueprint = false,
  className = "",
  children,
  ...props
}: AdminButtonProps) {
  const base =
    "relative inline-flex items-center justify-center gap-2 border px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-60";
  const styles =
    variant === "primary"
      ? "border-accent bg-accent text-ink hover:opacity-90"
      : "border-transparent text-muted hover:border-border hover:text-foreground";
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {blueprint && <CornerMarks variant={variant === "primary" ? "border" : "accent"} />}
      {children}
    </button>
  );
}

export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}
