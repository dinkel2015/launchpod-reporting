// Downloads/plays totals must never be taken from this source for the total-downloads calculation —
// see lib/rules (downloads = apple_plays + spotify_plays only). PodSEO's Top 50/visibility figures are
// search-visibility signals, not download counts, and must never be summed into Total Downloads.

import { METRIC_KEYS } from "@/types/metrics";

import type { ColumnMapping, SourceConfig } from "./types";

const PLATFORMS = ["Apple", "Spotify", "Amazon", "YouTube"] as const;

const headline: ColumnMapping[] = [
  {
    metricKey: METRIC_KEYS.PODSEO_VISIBILITY_SCORE,
    originalLabel: "Overall Visibility Score",
    unit: "score",
    acceptedHeaders: ["Visibility Score", "Overall Visibility Score", "Overall Visibility Score /10"],
  },
  {
    // rankDirection: "lower_is_better" (set on SourceConfig below) applies to this metric.
    metricKey: METRIC_KEYS.PODSEO_VISIBILITY_RANK,
    originalLabel: "Visibility Rank",
    unit: "rank",
    acceptedHeaders: ["Visibility Rank"],
  },
  {
    metricKey: METRIC_KEYS.PODSEO_TOP50_TOTAL,
    originalLabel: "Top 50 Visibility",
    unit: "count",
    acceptedHeaders: ["Top 50 Visibility", "Top 50 Visibility (Total)"],
  },
];

// Apple/Spotify/Amazon/YouTube are a fixed, known set of platforms baked directly into each header's
// text (e.g. "Apple Top 50 Results"), so — unlike competitor/keyword rows — no dynamicKeySuffixFrom
// is needed here.
const top50ByPlatform: ColumnMapping[] = PLATFORMS.flatMap((platform) => {
  const slug = platform.toLowerCase();
  return [
    {
      metricKey: `podseo_top50_${slug}_results`,
      originalLabel: `${platform} Top 50 Results`,
      unit: "count",
      acceptedHeaders: [`${platform} Top 50 Results`],
    },
    {
      metricKey: `podseo_top50_${slug}_results_delta`,
      originalLabel: `${platform} Top 50 Results (vs. Last Month)`,
      unit: "count",
      acceptedHeaders: [`${platform} Top 50 Results (vs. Last Month)`, `${platform} Top 50 Results Δ`],
    },
  ];
});

// Keyword table is row-per-keyword: "Keyword" itself is an identifier (left unmapped, text has no
// MetricUnit), "Volume" and each platform's SERP position are folded per-keyword via
// dynamicKeySuffixFrom. A blank position cell means "not ranking in the top 50" and is stored as
// value: null, not an error — see csv-engine's blank-cell handling.
const keywordTable: ColumnMapping[] = [
  {
    metricKey: "podseo_keyword_volume",
    originalLabel: "Volume",
    unit: "count",
    acceptedHeaders: ["Volume"],
    dynamicKeySuffixFrom: "Keyword",
  },
  ...PLATFORMS.map(
    (platform): ColumnMapping => ({
      metricKey: `${METRIC_KEYS.PODSEO_KEYWORD_RANK_PREFIX}${platform.toLowerCase()}`,
      originalLabel: `${platform} Position`,
      unit: "rank",
      acceptedHeaders: [`${platform} Position`],
      dynamicKeySuffixFrom: "Keyword",
    }),
  ),
];

// Competitor table: "Competitor name", "Platforms", "7-Day Trend", and "Notes" are left unmapped —
// qualitative/text fields with no MetricUnit equivalent; the table renderer reads them straight off
// the raw CSV row instead of via the metric pipeline. "Visibility Rank" and "Episodes (30d)" are
// folded per-competitor via dynamicKeySuffixFrom.
//
// The 7-Day Trend arrow follows the same convention as lib/rules/podseo-rank.ts's trendArrow(): an
// up-arrow means the rank NUMBER went down (improvement). Don't invert this when building the UI.
//
// The raw row order of this table is NOT sorted by rank — csv-engine parses rows in file order and
// does not reorder them. Sort by the composed podseo_competitor_rank_* values (ascending, lower is
// better) downstream before display; see lib/validation/competitor-order.ts.
const competitorTable: ColumnMapping[] = [
  {
    metricKey: METRIC_KEYS.PODSEO_COMPETITOR_RANK_PREFIX,
    originalLabel: "Visibility Rank",
    unit: "rank",
    acceptedHeaders: ["Visibility Rank"],
    dynamicKeySuffixFrom: "Competitor name",
  },
  {
    metricKey: "podseo_competitor_episodes_30d_",
    originalLabel: "Episodes (30d)",
    unit: "count",
    acceptedHeaders: ["Episodes (30d)", "Episodes"],
    dynamicKeySuffixFrom: "Competitor name",
  },
];

const STAR_LEVELS = [5, 4, 3, 2, 1] as const;
const RATED_PLATFORMS = ["Apple", "Spotify"] as const;

const ratings: ColumnMapping[] = [
  ...RATED_PLATFORMS.flatMap((platform) => {
    const slug = platform.toLowerCase();
    return [
      {
        metricKey: `podseo_${slug}_rating_average`,
        originalLabel: `${platform} Rating`,
        unit: "score" as const,
        acceptedHeaders: [`${platform} Rating`, `${platform} Stars`],
      },
      {
        metricKey: `podseo_${slug}_rating_count`,
        originalLabel: `${platform} Ratings`,
        unit: "count" as const,
        acceptedHeaders: [`${platform} Ratings`, `${platform} Ratings Count`],
      },
      ...STAR_LEVELS.map(
        (star): ColumnMapping => ({
          metricKey: `podseo_${slug}_rating_${star}_star_count`,
          originalLabel: `${platform} ${star} Star`,
          unit: "count",
          acceptedHeaders: [`${platform} ${star} Star`, `${platform} ${star} Stars`],
        }),
      ),
    ];
  }),
  {
    metricKey: "podseo_review_sentiment_pct",
    originalLabel: "Sentiment",
    unit: "percent",
    acceptedHeaders: ["Sentiment", "Sentiment %", "Positive Sentiment"],
  },
];

export const podseoConfig: SourceConfig = {
  source: "podseo",
  columns: [...headline, ...top50ByPlatform, ...keywordTable, ...competitorTable, ...ratings],
  // The only exception is chart peak/current-status metrics (METRIC_KEYS.PODSEO_CHART_CURRENT_STATUS),
  // which aren't numeric ranks at all — this flag only governs "rank"-unit metrics.
  rankDirection: "lower_is_better",
};
