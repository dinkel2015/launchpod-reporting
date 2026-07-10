import { SectionCard } from "../section-card";
import { CalloutCard } from "../callout-card";
import type { WhatsWorkingFocusContent } from "@/types/sections";

export function WhatsWorkingFocus({ order, content }: { order: string; content: WhatsWorkingFocusContent }) {
  return (
    <SectionCard number={order} title="What's Happening This Month">
      <div className="grid gap-4 md:grid-cols-2">
        <CalloutCard tone="positive" title="What's working">
          {content.whatsWorking}
        </CalloutCard>
        <CalloutCard tone="focus" title="Where to focus next">
          {content.whereToFocus}
        </CalloutCard>
      </div>
      <CalloutCard tone="big_picture" title="The big picture">
        {content.bigPicture}
      </CalloutCard>
    </SectionCard>
  );
}
