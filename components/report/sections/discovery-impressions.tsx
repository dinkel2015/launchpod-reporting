import { SectionCard } from "../section-card";
import { BarRow } from "../bar-row";
import { CalloutCard } from "../callout-card";
import { SourceTag } from "../source-tag";
import { formatNumber } from "@/lib/utils";
import type { DiscoveryImpressionsContent } from "@/types/sections";

export function DiscoveryImpressions({ order, content }: { order: string; content: DiscoveryImpressionsContent }) {
  const maxBreakdown = Math.max(...content.breakdown.map((b) => b.count), 1);

  return (
    <SectionCard number={order} title="How People Are Finding You">
      <div className="flex items-center justify-center gap-8 rounded-xl bg-surface-muted p-6">
        <div className="text-center">
          <p className="text-3xl font-extrabold text-brand-pink">{formatNumber(content.impressions)}</p>
          <p className="text-xs uppercase text-[#6b7580]">Times your show was seen</p>
        </div>
        <span className="text-2xl text-[#8b95a1]">→</span>
        <div className="text-center">
          <p className="text-3xl font-extrabold text-brand-pink">{formatNumber(content.plays)}</p>
          <p className="text-xs uppercase text-[#6b7580]">
            Actually listened · {content.conversionRatePercent}% conversion
          </p>
        </div>
      </div>

      <CalloutCard tone="focus" title="What this means for you">
        {content.whatThisMeans}
      </CalloutCard>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Where People Found Your Show</h3>
        {content.breakdown.map((row) => (
          <BarRow key={row.channel} label={row.channel} value={row.count} maxValue={maxBreakdown} />
        ))}
      </div>
      <CalloutCard tone="info" title="The good news here">
        {content.breakdownNote}
      </CalloutCard>
      <SourceTag>{content.sourceLine}</SourceTag>
    </SectionCard>
  );
}
