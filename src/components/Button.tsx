import Link from "next/link";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 ease-out active:scale-95";
  const styles = {
    primary:
      "bg-accent text-ink hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30",
    secondary:
      "border border-border text-foreground hover:-translate-y-0.5 hover:border-accent hover:text-accent-text",
    ghost: "text-accent-text hover:text-accent",
  }[variant];

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}
