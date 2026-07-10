import { SectionCard } from "../section-card";
import { StatCard } from "../stat-card";
import { CalloutCard } from "../callout-card";
import { SourceTag } from "../source-tag";
import type { MonthOverMonthSnapshotContent } from "@/types/sections";

export function MonthOverMonthSnapshot({
  order,
  content,
}: {
  order: string;
  content: MonthOverMonthSnapshotContent;
}) {
  return (
    <SectionCard
      number={order}
      title="Month-over-Month Snapshot"
      description="How your key numbers moved vs. the prior period. Percentages show change vs. prior month; raw numbers used where a percentage wouldn't be meaningful."
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {content.stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      {content.appleNote && (
        <CalloutCard tone="focus" title="A note on this month's Apple numbers">
          {content.appleNote}
        </CalloutCard>
      )}
      <CalloutCard tone="info" title="What this means">
        {content.whatThisMeans}
      </CalloutCard>
      <SourceTag>{content.sourceLine}</SourceTag>
    </SectionCard>
  );
}
