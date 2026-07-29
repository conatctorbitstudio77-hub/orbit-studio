import { Container } from "./Container";

export function Section({
  children,
  className = "",
  containerClassName = "",
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <section className={`py-20 md:py-28 ${className}`}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-accent-text">
      <span className="h-px w-6 bg-accent" />
      {children}
    </p>
  );
}
