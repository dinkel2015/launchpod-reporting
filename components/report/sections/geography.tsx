import { SectionCard } from "../section-card";
import { BarRow } from "../bar-row";
import { CalloutCard } from "../callout-card";
import { SourceTag } from "../source-tag";
import type { GeographyContent } from "@/types/sections";

export function Geography({ order, content }: { order: string; content: GeographyContent }) {
  return (
    <SectionCard number={order} title="Where Your Listeners Are">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Listeners by Country</h3>
        {content.countries.map((row) => (
          <BarRow key={row.name} label={row.name} value={row.percent} maxValue={100} displayValue={`${row.percent}%`} />
        ))}
      </div>
      <CalloutCard tone="info" title="A note on international listeners">
        {content.note}
      </CalloutCard>
      <SourceTag>{content.sourceLine}</SourceTag>
    </SectionCard>
  );
}
