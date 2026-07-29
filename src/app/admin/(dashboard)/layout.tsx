import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { site } from "@/lib/site";

const adminNav = [
  { label: "Quotes", href: "/admin/quotes" },
  { label: "Case Studies", href: "/admin/case-studies" },
  { label: "Blog", href: "/admin/blog" },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/admin/quotes"
            className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight"
          >
            <Logo className="h-7 w-7" />
            {site.name}
            <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted">
              Admin
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-5">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
