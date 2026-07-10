import { SectionCard } from "../section-card";
import { Badge } from "@/components/ui/badge";
import type { RecommendationsContent } from "@/types/sections";

export function Recommendations({ order, content }: { order: string; content: RecommendationsContent }) {
  return (
    <SectionCard number={order} title="Moving Forward" description="The most impactful things to focus on next.">
      <ol className="space-y-4">
        {content.items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-pink text-xs font-bold text-white">
              {i + 1}
            </span>
            <div>
              <Badge tone={item.owner === "lpm" ? "lpm" : item.owner === "client" ? "client" : "pink"}>
                {item.owner}
              </Badge>
              <p className="mt-1 text-sm text-[#171717]">{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}
