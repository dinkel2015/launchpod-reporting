// Shape of `report_sections.content_json` per section_type. Loosely typed on
// the DB side (jsonb) but every renderer + the editor should agree on this.

export type StatCardData = {
  value: string;
  label: string;
  delta?: string;
  deltaDirection?: "positive" | "negative" | "neutral";
  sublabel?: string;
};

export type CoverContent = {
  clientName: string;
  podcastName: string;
  tagline?: string;
  hosts: string;
  reportMonth: string;
  totalEpisodes: number;
};

export type MonthOverMonthSnapshotContent = {
  stats: StatCardData[];
  appleNote?: string;
  whatThisMeans: string;
  sourceLine: string;
};

export type WhatsWorkingFocusContent = {
  whatsWorking: string;
  whereToFocus: string;
  bigPicture: string;
};

export type DownloadHistoryContent = {
  threeMonth: { label: string; value: number }[];
  elevenMonth: { label: string; value: number }[];
  whatThisShows: string;
  quarterlyNote?: string;
  sourceLine: string;
};

export type PublishingDayTrendsContent = {
  days: { day: string; level: "low" | "moderate" | "strong"; isPublishDay: boolean }[];
  note: string;
  sourceLine: string;
};

export type AudienceContent = {
  stats: StatCardData[];
  gender: { label: string; percent: number }[];
  age: { label: string; percent: number }[];
  coreListenerNote: string;
  sourceLine: string;
};

export type EpisodePerformanceContent = {
  windowNote: string;
  episodes: {
    title: string;
    releasedDate: string;
    listeners: number;
    stayed: number;
    completionPercent: number;
    vsTypicalPercent: number;
    isBest?: boolean;
  }[];
  driverNote: string;
  completionNote: string;
  sourceLine: string;
};

export type RatingsReviewsContent = {
  apple: { rating: number; count: number; writtenReviews?: number };
  spotify: { rating: number; count: number };
  reviews: { stars: number; title: string; body: string; author: string; platform: string; date: string }[];
  sourceLine: string;
};

export type ChartRankingsContent = {
  currentStatus: string;
  isCurrentlyCharting: boolean;
  historicalPeak?: {
    rank: number;
    denominator?: number;
    category: string;
    platform: string;
    market: string;
    period: string;
  };
  note: string;
  sourceLine: string;
};

export type DiscoveryImpressionsContent = {
  impressions: number;
  plays: number;
  conversionRatePercent: number;
  completionRatePercent: number;
  whatThisMeans: string;
  breakdown: { channel: string; count: number }[];
  breakdownNote: string;
  history: { month: string; shown: number; interested: number | null; consumed: number }[];
  sourceLine: string;
};

export type SearchVisibilityContent = {
  stats: StatCardData[];
  rankedNumberOne: string[];
  primaryKeywords: string[];
  secondaryKeywords: string[];
  growingKeywords: string[];
  brightSpotNote: string;
  sourceLine: string;
};

export type CompetitorRow = {
  name: string;
  visibilityRank: number;
  trend: "gaining" | "losing" | "flat";
  recentEpisodes: string;
  notes: string;
  isClient?: boolean;
};

export type CompetitorComparisonContent = {
  competitors: CompetitorRow[]; // must be sorted ascending by visibilityRank before render
  takeaway: string;
  sourceLine: string;
};

export type GeographyContent = {
  countries: { name: string; percent: number }[];
  note: string;
  sourceLine: string;
};

export type RecommendationItem = {
  text: string;
  owner: "client" | "lpm" | "shared";
};

export type RecommendationsContent = {
  items: RecommendationItem[];
};
