import { SectionCard } from "../section-card";
import { CalloutCard } from "../callout-card";
import { SourceTag } from "../source-tag";
import { cn } from "@/lib/utils";
import type { PublishingDayTrendsContent } from "@/types/sections";

const levelHeight: Record<string, string> = { low: "h-2", moderate: "h-4", strong: "h-7" };
const levelColor: Record<string, string> = {
  low: "bg-[#f7c9de]",
  moderate: "bg-[#f290bb]",
  strong: "bg-brand-pink",
};

export function PublishingDayTrends({ order, content }: { order: string; content: PublishingDayTrendsContent }) {
  return (
    <SectionCard
      number={order}
      title="When Your Listeners Tune In"
      description="Day-of-week listening patterns, based on the show's established trend — useful for choosing the best day to publish new episodes."
    >
      <div className="grid grid-cols-7 gap-2 text-center">
        {content.days.map((day) => (
          <div
            key={day.day}
            className={cn(
              "rounded-lg p-3",
              day.isPublishDay ? "border-2 border-brand-pink bg-brand-pink-tint" : "bg-surface-muted",
            )}
          >
            <div className={cn("mx-auto mb-2 w-6 rounded", levelHeight[day.level], levelColor[day.level])} />
            <p className="text-xs text-[#6b7580] capitalize">{day.level}</p>
            <p className="text-xs font-semibold">{day.day}</p>
            {day.isPublishDay && <p className="mt-1 text-[10px] font-bold text-brand-pink">Publish day</p>}
          </div>
        ))}
      </div>
      <CalloutCard tone="info" title="Publishing day check">
        {content.note}
      </CalloutCard>
      <SourceTag>{content.sourceLine}</SourceTag>
    </SectionCard>
  );
}
