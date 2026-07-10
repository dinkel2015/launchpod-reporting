import { SectionCard } from "../section-card";
import { StatCard } from "../stat-card";
import { BarRow } from "../bar-row";
import { CalloutCard } from "../callout-card";
import { SourceTag } from "../source-tag";
import type { AudienceContent } from "@/types/sections";

export function Audience({ order, content }: { order: string; content: AudienceContent }) {
  return (
    <SectionCard number={order} title="Your Audience">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {content.stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold">Who's Listening — Gender (Spotify, All-Time)</h3>
          {content.gender.map((row) => (
            <BarRow key={row.label} label={row.label} value={row.percent} maxValue={100} displayValue={`${row.percent}%`} />
          ))}
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">Who's Listening — Age (Spotify, All-Time)</h3>
          {content.age.map((row) => (
            <BarRow key={row.label} label={row.label} value={row.percent} maxValue={100} displayValue={`${row.percent}%`} />
          ))}
        </div>
      </div>

      <CalloutCard tone="info" title="Your core listener">
        {content.coreListenerNote}
      </CalloutCard>
      <SourceTag>{content.sourceLine}</SourceTag>
    </SectionCard>
  );
}
