import type { SectionType } from "@/types/report";
import type {
  CoverContent,
  MonthOverMonthSnapshotContent,
  WhatsWorkingFocusContent,
  DownloadHistoryContent,
  PublishingDayTrendsContent,
  AudienceContent,
  EpisodePerformanceContent,
  RatingsReviewsContent,
  ChartRankingsContent,
  DiscoveryImpressionsContent,
  SearchVisibilityContent,
  CompetitorComparisonContent,
  GeographyContent,
  RecommendationsContent,
} from "@/types/sections";
import { Cover } from "./sections/cover";
import { MonthOverMonthSnapshot } from "./sections/month-over-month-snapshot";
import { WhatsWorkingFocus } from "./sections/whats-working-focus";
import { DownloadHistory } from "./sections/download-history";
import { PublishingDayTrends } from "./sections/publishing-day-trends";
import { Audience } from "./sections/audience";
import { EpisodePerformance } from "./sections/episode-performance";
import { RatingsReviews } from "./sections/ratings-reviews";
import { ChartRankings } from "./sections/chart-rankings";
import { DiscoveryImpressions } from "./sections/discovery-impressions";
import { SearchVisibility } from "./sections/search-visibility";
import { CompetitorComparison } from "./sections/competitor-comparison";
import { Geography } from "./sections/geography";
import { Recommendations } from "./sections/recommendations";

/**
 * `content_json` is a jsonb column, so its shape can only be guaranteed by
 * convention (types/sections.ts) — the cast per case below is the one place
 * that contract is asserted. Callers are responsible for writing content
 * that matches the section_type they choose.
 */
export function SectionRenderer({
  sectionType,
  order,
  content,
}: {
  sectionType: SectionType;
  order: string;
  content: Record<string, unknown>;
}) {
  switch (sectionType) {
    case "cover":
      return <Cover content={content as unknown as CoverContent} />;
    case "month_over_month_snapshot":
      return <MonthOverMonthSnapshot order={order} content={content as unknown as MonthOverMonthSnapshotContent} />;
    case "whats_working_focus":
      return <WhatsWorkingFocus order={order} content={content as unknown as WhatsWorkingFocusContent} />;
    case "download_history":
    case "growth_over_time":
      return <DownloadHistory order={order} content={content as unknown as DownloadHistoryContent} />;
    case "publishing_day_trends":
      return <PublishingDayTrends order={order} content={content as unknown as PublishingDayTrendsContent} />;
    case "audience":
      return <Audience order={order} content={content as unknown as AudienceContent} />;
    case "episode_performance":
    case "completion_retention":
      return <EpisodePerformance order={order} content={content as unknown as EpisodePerformanceContent} />;
    case "ratings_reviews":
      return <RatingsReviews order={order} content={content as unknown as RatingsReviewsContent} />;
    case "chart_rankings":
      return <ChartRankings order={order} content={content as unknown as ChartRankingsContent} />;
    case "discovery_impressions":
      return <DiscoveryImpressions order={order} content={content as unknown as DiscoveryImpressionsContent} />;
    case "search_visibility":
    case "keyword_rankings":
      return <SearchVisibility order={order} content={content as unknown as SearchVisibilityContent} />;
    case "competitor_comparison":
      return <CompetitorComparison order={order} content={content as unknown as CompetitorComparisonContent} />;
    case "geography":
      return <Geography order={order} content={content as unknown as GeographyContent} />;
    case "recommendations":
      return <Recommendations order={order} content={content as unknown as RecommendationsContent} />;
    default:
      return null;
  }
}
