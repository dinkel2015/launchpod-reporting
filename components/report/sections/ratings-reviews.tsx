import { SectionCard } from "../section-card";
import { SourceTag } from "../source-tag";
import type { RatingsReviewsContent } from "@/types/sections";

export function RatingsReviews({ order, content }: { order: string; content: RatingsReviewsContent }) {
  return (
    <SectionCard number={order} title="Ratings & Reviews">
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2">
          <span className="font-medium">Apple</span>
          <span className="text-sm text-[#6b7580]">
            <span className="mr-2 font-bold text-brand-pink">{content.apple.rating.toFixed(1)}</span>
            {content.apple.count} ratings
            {content.apple.writtenReviews ? ` · ${content.apple.writtenReviews} written reviews` : ""}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-border-subtle pb-2">
          <span className="font-medium">Spotify</span>
          <span className="text-sm text-[#6b7580]">
            <span className="mr-2 font-bold text-brand-pink">{content.spotify.rating.toFixed(1)}</span>
            {content.spotify.count} ratings
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {content.reviews.map((review, i) => (
          <div key={i} className="rounded-lg bg-brand-pink-tint p-4">
            <p className="mb-1 text-amber-500">{"★".repeat(review.stars)}</p>
            <p className="mb-1 text-sm font-semibold">{review.title}</p>
            <p className="mb-2 text-xs text-[#3a4149]">{review.body}</p>
            <p className="text-[10px] text-[#8b95a1]">
              {review.author} · {review.platform} · {review.date}
            </p>
          </div>
        ))}
      </div>
      <SourceTag>{content.sourceLine}</SourceTag>
    </SectionCard>
  );
}
