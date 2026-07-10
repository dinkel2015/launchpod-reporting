import type { ReactNode } from "react";

export function SectionCard({
  number,
  title,
  children,
  description,
}: {
  number: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="section-card rounded-2xl bg-surface p-8 shadow-sm">
      <div className="mb-1 flex items-baseline gap-2">
        <span className="text-sm font-bold text-brand-pink">{number}</span>
        <h2 className="text-lg font-bold tracking-tight text-[#171717]">{title}</h2>
      </div>
      <div className="mb-5 border-b border-border-subtle pb-4">
        {description && <p className="mt-1 text-sm text-[#6b7580]">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
