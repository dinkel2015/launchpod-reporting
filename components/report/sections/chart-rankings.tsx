import { SectionCard } from "../section-card";
import { CalloutCard } from "../callout-card";
import { SourceTag } from "../source-tag";
import type { ChartRankingsContent } from "@/types/sections";

export function ChartRankings({ order, content }: { order: string; content: ChartRankingsContent }) {
  return (
    <SectionCard number={order} title="Chart Rankings">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-[#fdf1de] p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8a5a12]">Right now</p>
          <p className="mt-1 text-xl font-extrabold text-[#8a5a12]">
            {content.isCurrentlyCharting ? content.currentStatus : "Not Charting"}
          </p>
          <p className="mt-1 text-xs text-[#8a5a12]">{content.currentStatus}</p>
        </div>
        {content.historicalPeak && (
          <div className="rounded-xl bg-surface-muted p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7580]">
              Best position this year
            </p>
            <p className="mt-1 text-3xl font-extrabold text-brand-pink">#{content.historicalPeak.rank}</p>
            <p className="mt-1 text-xs text-[#6b7580]">
              {content.historicalPeak.category} · {content.historicalPeak.market} · earlier in{" "}
              {content.historicalPeak.period}
            </p>
          </div>
        )}
      </div>
      <CalloutCard tone="info" title="What it takes to chart again">
        {content.note}
      </CalloutCard>
      <SourceTag>{content.sourceLine}</SourceTag>
    </SectionCard>
  );
}
