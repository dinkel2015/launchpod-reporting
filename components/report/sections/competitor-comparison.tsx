import { SectionCard } from "../section-card";
import { CalloutCard } from "../callout-card";
import { SourceTag } from "../source-tag";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CompetitorComparisonContent } from "@/types/sections";

/** Callers must pre-sort ascending by visibilityRank — see lib/validation/competitor-order.ts, enforced at publish time. */
export function CompetitorComparison({ order, content }: { order: string; content: CompetitorComparisonContent }) {
  return (
    <SectionCard number={order} title="How You Compare" description="Lower rank number means stronger visibility.">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-left text-xs font-semibold uppercase text-[#8b95a1]">
            <th className="pb-2">Show</th>
            <th className="pb-2">Visibility rank</th>
            <th className="pb-2">Trend</th>
            <th className="pb-2">Recent episodes</th>
            <th className="pb-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {content.competitors.map((row) => (
            <tr
              key={row.name}
              className={cn("border-b border-border-subtle", row.isClient && "bg-brand-pink-tint")}
            >
              <td className="py-2 pr-3 font-medium">
                {row.isClient && "⭐ "}
                {row.name}
              </td>
              <td className="py-2 pr-3">#{row.visibilityRank.toLocaleString()}</td>
              <td className="py-2 pr-3">
                <Badge tone={row.trend === "gaining" ? "green" : row.trend === "losing" ? "red" : "neutral"}>
                  {row.trend === "gaining" ? "↑ gaining" : row.trend === "losing" ? "↓ losing" : "flat"}
                </Badge>
              </td>
              <td className="py-2 pr-3">{row.recentEpisodes}</td>
              <td className="py-2 pr-3 text-xs text-[#6b7580]">{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <CalloutCard tone="big_picture" title="What this tells us">
        {content.takeaway}
      </CalloutCard>
      <SourceTag>{content.sourceLine}</SourceTag>
    </SectionCard>
  );
}
