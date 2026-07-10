import { METRIC_KEYS } from "@/types/metrics";

import { parseNumericCell } from "./csv-engine";
import type { ColumnMapping, SourceConfig } from "./types";

const playsAndStreams: ColumnMapping[] = [
  // Spotify for Creators tracks "Plays" (any playback) and "Streams" (crossed Spotify's completion
  // threshold) as genuinely distinct metrics, not aliases of each other — only Plays feeds Total Downloads.
  { metricKey: METRIC_KEYS.SPOTIFY_PLAYS, originalLabel: "Plays", unit: "count", acceptedHeaders: ["Plays", "Total Plays"] },
  { metricKey: METRIC_KEYS.SPOTIFY_STREAMS, originalLabel: "Streams", unit: "count", acceptedHeaders: ["Streams"] },
  {
    metricKey: METRIC_KEYS.SPOTIFY_CONSUMPTION_TIME_MIN,
    originalLabel: "Consumption time (minutes)",
    unit: "minutes",
    acceptedHeaders: ["Consumption time (minutes)", "Consumption Time"],
  },
  {
    // Same metric key as above — export sometimes reports the identical figure in hours instead of minutes.
    metricKey: METRIC_KEYS.SPOTIFY_CONSUMPTION_TIME_MIN,
    originalLabel: "Consumption time (hours)",
    unit: "minutes",
    acceptedHeaders: ["Consumption time (hours)"],
    transform: (raw) => {
      const hours = parseNumericCell(raw);
      return hours === null ? null : hours * 60;
    },
  },
  {
    metricKey: "spotify_average_consumption_time_minutes",
    originalLabel: "Average consumption time",
    unit: "minutes",
    acceptedHeaders: ["Average consumption time"],
  },
  { metricKey: "spotify_comments", originalLabel: "Comments", unit: "count", acceptedHeaders: ["Comments"] },
  {
    metricKey: METRIC_KEYS.SPOTIFY_FOLLOWERS_NEW,
    originalLabel: "Followers",
    unit: "count",
    acceptedHeaders: ["Followers", "New Followers"],
  },
  { metricKey: METRIC_KEYS.SPOTIFY_IMPRESSIONS, originalLabel: "Impressions", unit: "count", acceptedHeaders: ["Impressions"] },
  {
    metricKey: METRIC_KEYS.SPOTIFY_CONVERSION_RATE,
    originalLabel: "Conversion rate",
    unit: "percent",
    acceptedHeaders: ["Conversion rate", "Conversion Rate (%)"],
  },
  {
    metricKey: METRIC_KEYS.SPOTIFY_COMPLETION_RATE,
    originalLabel: "Average completion rate",
    unit: "percent",
    acceptedHeaders: ["Average completion rate", "Average Completion Rate (%)"],
  },
];

// Audience segments pie: what share of plays came from listeners who already followed vs. new
// listeners vs. Spotify's own curated audience placements.
const audienceSegments: ColumnMapping[] = [
  { metricKey: "spotify_audience_returning_pct", originalLabel: "Returning", unit: "percent", acceptedHeaders: ["Returning"] },
  { metricKey: "spotify_audience_new_pct", originalLabel: "New", unit: "percent", acceptedHeaders: ["New"] },
  {
    metricKey: "spotify_audience_spotify_pct",
    originalLabel: "Spotify audience",
    unit: "percent",
    acceptedHeaders: ["Spotify audience"],
  },
];

const discoveryBreakdown: ColumnMapping[] = [
  { metricKey: METRIC_KEYS.SPOTIFY_DISCOVERY_HOME, originalLabel: "Home Feed", unit: "count", acceptedHeaders: ["Home Feed"] },
  { metricKey: METRIC_KEYS.SPOTIFY_DISCOVERY_SEARCH, originalLabel: "Search", unit: "count", acceptedHeaders: ["Search"] },
  { metricKey: METRIC_KEYS.SPOTIFY_DISCOVERY_LIBRARY, originalLabel: "Library", unit: "count", acceptedHeaders: ["Library"] },
  {
    metricKey: "spotify_discovery_other",
    originalLabel: "Other Spotify Features",
    unit: "count",
    acceptedHeaders: ["Other Spotify Features"],
  },
];

const genderBreakdown: ColumnMapping[] = [
  { metricKey: METRIC_KEYS.SPOTIFY_GENDER_MALE, originalLabel: "Male", unit: "percent", acceptedHeaders: ["Male"] },
  { metricKey: METRIC_KEYS.SPOTIFY_GENDER_FEMALE, originalLabel: "Female", unit: "percent", acceptedHeaders: ["Female"] },
  {
    metricKey: "spotify_gender_nonbinary_pct",
    originalLabel: "Non-binary",
    unit: "percent",
    acceptedHeaders: ["Non-binary"],
  },
  {
    metricKey: METRIC_KEYS.SPOTIFY_GENDER_NOT_SPECIFIED,
    originalLabel: "Not specified",
    unit: "percent",
    acceptedHeaders: ["Not specified"],
  },
];

// Age is a SEPARATE breakdown dataset from gender (different CSV export) — see
// lib/validation/demographics.ts, which blocks publish if a metric key ever combines the two.
const AGE_BUCKETS: ReadonlyArray<readonly [header: string, keySuffix: string]> = [
  ["0-17", "0_17"],
  ["18-22", "18_22"],
  ["23-27", "23_27"],
  ["28-34", "28_34"],
  ["35-44", "35_44"],
  ["45-59", "45_59"],
  ["60+", "60_plus"],
  ["Unknown", "unknown"],
];

const ageBreakdown: ColumnMapping[] = AGE_BUCKETS.map(([header, suffix]) => ({
  metricKey: `${METRIC_KEYS.SPOTIFY_AGE_BUCKET_PREFIX}${suffix}_pct`,
  originalLabel: header,
  unit: "percent",
  acceptedHeaders: [header],
}));

// Geography is row-per-country, not column-per-country: the "Percentage" header repeats once per
// country row, so the country name (from the sibling "Country" column) is folded into the metric key
// at parse time via dynamicKeySuffixFrom, matching SPOTIFY_GEO_COUNTRY_PREFIX's intended usage.
const geography: ColumnMapping[] = [
  {
    metricKey: METRIC_KEYS.SPOTIFY_GEO_COUNTRY_PREFIX,
    originalLabel: "Percentage",
    unit: "percent",
    acceptedHeaders: ["Percentage"],
    dynamicKeySuffixFrom: "Country",
  },
];

const STAR_LEVELS = [5, 4, 3, 2, 1] as const;

const ratings: ColumnMapping[] = [
  {
    metricKey: METRIC_KEYS.SPOTIFY_RATINGS_AVERAGE,
    originalLabel: "Average Rating",
    unit: "score",
    acceptedHeaders: ["Average Rating", "Rating"],
  },
  {
    metricKey: METRIC_KEYS.SPOTIFY_RATINGS_COUNT,
    originalLabel: "Ratings",
    unit: "count",
    acceptedHeaders: ["Ratings", "Ratings Count"],
  },
  ...STAR_LEVELS.map(
    (star): ColumnMapping => ({
      metricKey: `spotify_ratings_${star}_star_count`,
      originalLabel: `${star} Star`,
      unit: "count",
      acceptedHeaders: [`${star} Star`, `${star} Stars`, `${star}-Star`],
    }),
  ),
];

export const spotifyConfig: SourceConfig = {
  source: "spotify",
  columns: [
    ...playsAndStreams,
    ...audienceSegments,
    ...discoveryBreakdown,
    ...genderBreakdown,
    ...ageBreakdown,
    ...geography,
    ...ratings,
  ],
};
