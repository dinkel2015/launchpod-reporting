export type ReportStatus =
  | "draft"
  | "processing"
  | "needs_review"
  | "ready_to_publish"
  | "published"
  | "archived";

export type SectionType =
  | "cover"
  | "month_over_month_snapshot"
  | "executive_summary"
  | "whats_working_focus"
  | "download_history"
  | "growth_over_time"
  | "publishing_day_trends"
  | "audience"
  | "episode_performance"
  | "completion_retention"
  | "ratings_reviews"
  | "chart_rankings"
  | "discovery_impressions"
  | "search_visibility"
  | "keyword_rankings"
  | "competitor_comparison"
  | "geography"
  | "recommendations"
  | "sources_notes";

export const DEFAULT_SECTION_ORDER: SectionType[] = [
  "cover",
  "month_over_month_snapshot",
  "whats_working_focus",
  "download_history",
  "growth_over_time",
  "publishing_day_trends",
  "audience",
  "episode_performance",
  "ratings_reviews",
  "chart_rankings",
  "discovery_impressions",
  "search_visibility",
  "competitor_comparison",
  "geography",
  "recommendations",
];

export type ReportSection = {
  id: string;
  reportId: string;
  sectionType: SectionType;
  enabled: boolean;
  displayOrder: number;
  contentJson: Record<string, unknown>;
  internalNotes: string | null;
};

export type RecommendationOwner = "client" | "lpm" | "shared";

export type Recommendation = {
  id: string;
  reportId: string;
  text: string;
  owner: RecommendationOwner;
  included: boolean;
  displayOrder: number;
};

export type ReportObservation = {
  id: string;
  reportId: string;
  sourceType: string;
  metricKey: string;
  ruleId: string;
  generatedText: string;
  editedText: string | null;
  includedInReport: boolean;
  displayOrder: number;
};

export type Report = {
  id: string;
  clientId: string;
  title: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  reportMonth: string;
  expectedEpisodeFrequency: number | null;
  previousReportId: string | null;
  status: ReportStatus;
  humanContext: string | null;
  reportContentJson: Record<string, unknown> | null;
  publishedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReportUpload = {
  id: string;
  reportId: string;
  sourceType: "spotify" | "apple" | "podseo" | "hosting";
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  storagePath: string;
  snapshotDate: string | null;
  parsingStatus: "pending" | "processing" | "parsed" | "manual_only" | "failed";
  parsingErrors: string | null;
  validationStatus: "unverified" | "verified" | "conflict";
  uploadedAt: string;
};
