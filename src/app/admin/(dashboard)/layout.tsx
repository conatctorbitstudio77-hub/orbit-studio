import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { AdminTag } from "@/components/admin/ui";
import { site } from "@/lib/site";

const adminNav = [
  { label: "Overview", href: "/admin#overview" },
  { label: "Quotes", href: "/admin#quotes" },
  { label: "Calendar", href: "/admin#calendar" },
  { label: "Our Work", href: "/admin#case-studies" },
  { label: "Blog", href: "/admin#blog" },
  { label: "Clients", href: "/admin#clients" },
  { label: "Settings", href: "/admin#settings" },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-8 py-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Logo className="h-7 w-7" />
            <span className="font-display text-lg font-semibold uppercase tracking-wide">
              {site.name}
            </span>
            <AdminTag variant="outline">Admin</AdminTag>
          </Link>

          <nav className="flex flex-wrap gap-0.5">
            {adminNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1320px] px-8 pb-24">{children}</main>
    </div>
  );
}
