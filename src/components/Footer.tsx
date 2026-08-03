import Link from "next/link";
import { cacheLife } from "next/cache";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { nav, site } from "@/lib/site";

export async function Footer() {
  "use cache";
  cacheLife("days");

  return (
    <footer className="section-ink border-t border-border">
      <Container className="grid gap-10 py-16 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <p className="font-display text-lg font-semibold">{site.name}</p>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted">
            {site.description}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Site</p>
          <ul className="mt-4 space-y-3">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-muted transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/contact"
                className="text-sm text-muted transition-colors hover:text-accent"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Get in touch</p>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>{site.email}</li>
            <li>{site.phone}</li>
            <li>Serving {site.city} and beyond</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-border py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-muted md:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>Fixed-price websites for local service businesses.</p>
        </Container>
      </div>
    </footer>
  );
}
