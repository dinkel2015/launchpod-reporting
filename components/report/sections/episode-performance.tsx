import { SectionCard } from "../section-card";
import { CalloutCard } from "../callout-card";
import { SourceTag } from "../source-tag";
import { Badge } from "@/components/ui/badge";
import type { EpisodePerformanceContent } from "@/types/sections";

export function EpisodePerformance({ order, content }: { order: string; content: EpisodePerformanceContent }) {
  return (
    <SectionCard number={order} title="How Each Episode Performed" description={content.windowNote}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-left text-xs font-semibold uppercase text-[#8b95a1]">
            <th className="pb-2">Episode</th>
            <th className="pb-2">Released</th>
            <th className="pb-2">Listeners</th>
            <th className="pb-2">Stayed</th>
            <th className="pb-2">Completion</th>
            <th className="pb-2">vs. Typical</th>
          </tr>
        </thead>
        <tbody>
          {content.episodes.map((ep) => (
            <tr key={ep.title} className="border-b border-border-subtle">
              <td className="py-2 pr-3 font-medium">
                {ep.title} {ep.isBest && <Badge tone="pink" className="ml-1">Best</Badge>}
              </td>
              <td className="py-2 pr-3">{ep.releasedDate}</td>
              <td className="py-2 pr-3">{ep.listeners}</td>
              <td className="py-2 pr-3">{ep.stayed}</td>
              <td className="py-2 pr-3">{ep.completionPercent}%</td>
              <td className={`py-2 pr-3 font-semibold ${ep.vsTypicalPercent >= 0 ? "text-[#1a7a3d]" : "text-[#c02929]"}`}>
                {ep.vsTypicalPercent > 0 ? "+" : ""}
                {ep.vsTypicalPercent}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <CalloutCard tone="info" title="What drove the top episode">
        {content.driverNote}
      </CalloutCard>
      <CalloutCard tone="big_picture" title="The completion rate story">
        {content.completionNote}
      </CalloutCard>
      <SourceTag>{content.sourceLine}</SourceTag>
    </SectionCard>
  );
}
