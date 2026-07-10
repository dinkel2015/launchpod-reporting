import { METRIC_KEYS } from "@/types/metrics";

import { parseDurationToMinutes } from "./csv-engine";
import type { ColumnMapping, SourceConfig } from "./types";

// Episode-level "Name" and "Release Date" columns are intentionally not mapped here: MetricUnit has
// no text/date variant, and ReportMetric already carries dedicated periodStart/periodEnd/snapshotDate
// fields for temporal context — episode dates belong there (via csv-engine's normalizeDate), not as a
// metricKey/value pair. They will surface in ParseResult.unmappedHeaders, which is expected.

const showLevelColumns: ColumnMapping[] = [
  { metricKey: METRIC_KEYS.APPLE_FOLLOWERS, originalLabel: "Followers", unit: "count", acceptedHeaders: ["Followers"] },
  { metricKey: METRIC_KEYS.APPLE_LISTENERS, originalLabel: "Listeners", unit: "count", acceptedHeaders: ["Listeners"] },
  {
    metricKey: METRIC_KEYS.APPLE_ENGAGED_LISTENERS,
    originalLabel: "Engaged Listeners",
    unit: "count",
    acceptedHeaders: ["Engaged Listeners"],
  },
  {
    metricKey: METRIC_KEYS.APPLE_PLAYS,
    originalLabel: "Plays",
    unit: "count",
    acceptedHeaders: ["Plays", "Total Plays"],
  },
  {
    metricKey: "apple_new_followers",
    originalLabel: "New Followers",
    unit: "count",
    acceptedHeaders: ["New Followers"],
  },
  {
    metricKey: METRIC_KEYS.APPLE_TIME_LISTENED_HOURS,
    originalLabel: "Time Listened (hours)",
    unit: "hours",
    acceptedHeaders: ["Time Listened (hours)", "Time Listened"],
  },
  {
    metricKey: METRIC_KEYS.APPLE_CONSUMPTION_RATE,
    originalLabel: "Average Consumption (%)",
    unit: "percent",
    acceptedHeaders: ["Average Consumption (%)", "Average Consumption"],
  },
];

// Episode table reuses the show-level Listeners/Engaged Listeners/Plays/Average Consumption metric
// keys — each episode row is just another observation of the same metric, distinguished by rowIndex,
// not a different metric. Duration is the one truly episode-specific numeric field.
const episodeTableColumns: ColumnMapping[] = [
  {
    metricKey: "apple_episode_duration_minutes",
    originalLabel: "Duration",
    unit: "minutes",
    acceptedHeaders: ["Duration"],
    transform: parseDurationToMinutes,
  },
];

const ratingsColumns: ColumnMapping[] = [
  {
    metricKey: METRIC_KEYS.APPLE_RATINGS_AVERAGE,
    originalLabel: "Rating",
    unit: "score",
    acceptedHeaders: ["Rating", "Average Rating", "Star Rating"],
  },
  {
    metricKey: METRIC_KEYS.APPLE_RATINGS_COUNT,
    originalLabel: "Ratings",
    unit: "count",
    acceptedHeaders: ["Ratings", "Ratings Count", "Number of Ratings"],
  },
  {
    metricKey: "apple_written_reviews_count",
    originalLabel: "Written Reviews",
    unit: "count",
    acceptedHeaders: ["Written Reviews", "Reviews", "Reviews Count", "Number of Reviews"],
  },
];

export const appleConfig: SourceConfig = {
  source: "apple",
  columns: [...showLevelColumns, ...episodeTableColumns, ...ratingsColumns],
};
