import { SectionCard } from "../section-card";
import { StatCard } from "../stat-card";
import { CalloutCard } from "../callout-card";
import { SourceTag } from "../source-tag";
import type { SearchVisibilityContent } from "@/types/sections";

function KeywordChips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full bg-brand-pink-tint px-3 py-1 text-xs font-medium text-brand-pink">
          {item}
        </span>
      ))}
    </div>
  );
}

export function SearchVisibility({ order, content }: { order: string; content: SearchVisibilityContent }) {
  return (
    <SectionCard number={order} title="Your Search Presence">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {content.stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Where You&apos;re Ranked #1</h3>
        <KeywordChips items={content.rankedNumberOne} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">What You Rank For — Primary</h3>
        <KeywordChips items={content.primaryKeywords} />
      </div>

      {content.growingKeywords.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Growing Search Areas to Watch</h3>
          <KeywordChips items={content.growingKeywords} />
        </div>
      )}

      <CalloutCard tone="info" title="The bright spot">
        {content.brightSpotNote}
      </CalloutCard>
      <SourceTag>{content.sourceLine}</SourceTag>
    </SectionCard>
  );
}
