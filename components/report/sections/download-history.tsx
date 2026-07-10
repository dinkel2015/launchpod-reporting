import { SectionCard } from "../section-card";
import { BarRow } from "../bar-row";
import { CalloutCard } from "../callout-card";
import { SourceTag } from "../source-tag";
import type { DownloadHistoryContent } from "@/types/sections";

export function DownloadHistory({ order, content }: { order: string; content: DownloadHistoryContent }) {
  const threeMonthMax = Math.max(...content.threeMonth.map((p) => p.value), 1);
  const elevenMonthMax = Math.max(...content.elevenMonth.map((p) => p.value), 1);

  return (
    <SectionCard
      number={order}
      title="Download History"
      description="Combined Apple + Spotify plays. Apple Podcasts Connect + Spotify for Creators only."
    >
      <div className="space-y-1">
        {content.threeMonth.map((point) => (
          <BarRow key={point.label} label={point.label} value={point.value} maxValue={threeMonthMax} />
        ))}
      </div>

      <div>
        <h3 className="mb-1 text-sm font-semibold">Growth Over Time</h3>
        <div className="flex items-end gap-1.5" style={{ height: 120 }}>
          {content.elevenMonth.map((point) => (
            <div key={point.label} className="flex flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[10px] text-[#8b95a1]">{point.value}</span>
              <div
                className="w-full rounded-t bg-brand-pink"
                style={{ height: `${(point.value / elevenMonthMax) * 100}%`, minHeight: 2 }}
              />
              <span className="text-[9px] text-[#8b95a1]">{point.label}</span>
            </div>
          ))}
        </div>
      </div>

      <CalloutCard tone="info" title="What this shows">
        {content.whatThisShows}
      </CalloutCard>
      {content.quarterlyNote && (
        <CalloutCard tone="big_picture" title="What this means">
          {content.quarterlyNote}
        </CalloutCard>
      )}
      <SourceTag>{content.sourceLine}</SourceTag>
    </SectionCard>
  );
}
