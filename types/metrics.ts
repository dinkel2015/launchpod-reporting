export type SourcePlatform = "apple" | "spotify" | "podseo" | "hosting";

export type MetricUnit =
  | "count"
  | "percent"
  | "minutes"
  | "hours"
  | "rank"
  | "score";

export type AuthorityLevel =
  | "authoritative_csv"
  | "platform_export"
  | "verified_screenshot"
  | "manual_verified";

export type VerificationStatus =
  | "unverified"
  | "verified"
  | "conflict"
  | "excluded";

export type ReportMetric = {
  id: string;
  reportId: string;
  sourcePlatform: SourcePlatform;

  uploadId: string | null;

  metricKey: string;
  originalLabel: string;
  displayLabel: string;

  value: number | string | null;
  previousValue: number | null;
  calculatedDelta: number | null;

  unit: MetricUnit;

  periodStart: string | null;
  periodEnd: string | null;
  snapshotDate: string | null;

  authorityLevel: AuthorityLevel;
  verificationStatus: VerificationStatus;

  sourcePage: number | null;
  sourceReference: string | null;
  manuallyAdjusted: boolean;
  includedInReport: boolean;
  notes: string | null;
};

/** Canonical metric keys the rule engine and section generators depend on. */
export const METRIC_KEYS = {
  APPLE_PLAYS: "apple_plays",
  APPLE_LISTENERS: "apple_listeners",
  APPLE_ENGAGED_LISTENERS: "apple_engaged_listeners",
  APPLE_FOLLOWERS: "apple_followers",
  APPLE_TIME_LISTENED_HOURS: "apple_time_listened_hours",
  APPLE_RATINGS_COUNT: "apple_ratings_count",
  APPLE_RATINGS_AVERAGE: "apple_ratings_average",
  APPLE_TOP50_KEYWORDS: "apple_top50_keyword_count",
  APPLE_CONSUMPTION_RATE: "apple_average_consumption_rate",

  SPOTIFY_PLAYS: "spotify_plays",
  SPOTIFY_STREAMS: "spotify_streams",
  SPOTIFY_FOLLOWERS_NEW: "spotify_new_followers",
  SPOTIFY_FOLLOWERS_TOTAL: "spotify_followers_total",
  SPOTIFY_CONSUMPTION_TIME_MIN: "spotify_consumption_time_minutes",
  SPOTIFY_COMPLETION_RATE: "spotify_average_completion_rate",
  SPOTIFY_RATINGS_COUNT: "spotify_ratings_count",
  SPOTIFY_RATINGS_AVERAGE: "spotify_ratings_average",
  SPOTIFY_IMPRESSIONS: "spotify_impressions",
  SPOTIFY_CONVERSION_RATE: "spotify_conversion_rate",
  SPOTIFY_DISCOVERY_SEARCH: "spotify_discovery_search",
  SPOTIFY_DISCOVERY_HOME: "spotify_discovery_home_feed",
  SPOTIFY_DISCOVERY_LIBRARY: "spotify_discovery_library",
  SPOTIFY_TOP50_KEYWORDS: "spotify_top50_keyword_count",
  SPOTIFY_GENDER_MALE: "spotify_gender_male_pct",
  SPOTIFY_GENDER_FEMALE: "spotify_gender_female_pct",
  SPOTIFY_GENDER_NOT_SPECIFIED: "spotify_gender_not_specified_pct",
  SPOTIFY_AGE_BUCKET_PREFIX: "spotify_age_",
  SPOTIFY_GEO_COUNTRY_PREFIX: "spotify_geo_country_",

  PODSEO_VISIBILITY_RANK: "podseo_visibility_rank",
  PODSEO_VISIBILITY_SCORE: "podseo_visibility_score",
  PODSEO_TOP50_TOTAL: "podseo_top50_total_results",
  PODSEO_KEYWORD_RANK_PREFIX: "podseo_keyword_rank_",
  PODSEO_CHART_PEAK_RANK: "podseo_chart_peak_rank",
  PODSEO_CHART_CURRENT_STATUS: "podseo_chart_current_status",
  PODSEO_COMPETITOR_RANK_PREFIX: "podseo_competitor_rank_",

  HOSTING_DEVICE_SHARE_PREFIX: "hosting_device_share_",
  HOSTING_DAY_OF_WEEK_PREFIX: "hosting_day_of_week_",

  TOTAL_DOWNLOADS: "total_downloads",
} as const;

export type MetricKeyValue = (typeof METRIC_KEYS)[keyof typeof METRIC_KEYS] | string;
