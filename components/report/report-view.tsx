import { SectionRenderer } from "./section-renderer";
import type { SectionType } from "@/types/report";

export type RenderableSection = {
  id: string;
  sectionType: string;
  enabled: boolean;
  displayOrder: number;
  contentJson: Record<string, unknown>;
};

export function ReportView({
  sections,
  footerNote,
}: {
  sections: RenderableSection[];
  footerNote?: string;
}) {
  const cover = sections.find((s) => s.sectionType === "cover" && s.enabled);
  const rest = sections
    .filter((s) => s.sectionType !== "cover" && s.enabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div id="report-root" className="space-y-6 bg-background p-6">
      {cover && (
        <SectionRenderer sectionType="cover" order="" content={cover.contentJson} />
      )}
      {rest.map((section, index) => (
        <SectionRenderer
          key={section.id}
          sectionType={section.sectionType as SectionType}
          order={String(index + 1).padStart(2, "0")}
          content={section.contentJson}
        />
      ))}
      {footerNote && (
        <footer className="rounded-2xl bg-[#12081a] p-6 text-center text-xs text-white/60">
          {footerNote}
        </footer>
      )}
    </div>
  );
}
