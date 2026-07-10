import type { ReportMetric } from "@/types/metrics";
import { METRIC_KEYS } from "@/types/metrics";
import type { GeneratedObservation } from "@/lib/rules/types";
import { calculateTotalDownloads } from "@/lib/rules/downloads";
import { rankDirection } from "@/lib/rules/podseo-rank";
import type {
  MonthOverMonthSnapshotContent,
  AudienceContent,
  SearchVisibilityContent,
  CompetitorComparisonContent,
  StatCardData,
} from "@/types/sections";

function findMetric(metrics: ReportMetric[], key: string): ReportMetric | null {
  return metrics.find((m) => m.metricKey === key && m.includedInReport) ?? null;
}

function statFromMetric(
  metrics: ReportMetric[],
  key: string,
  label: string,
  formatValue: (v: number | string) => string = (v) => String(v),
): StatCardData | null {
  const metric = findMetric(metrics, key);
  if (!metric || metric.value === null) return null;

  let delta: string | undefined;
  let direction: StatCardData["deltaDirection"] = "neutral";
  if (metric.calculatedDelta !== null && metric.previousValue !== null) {
    const isRank = metric.unit === "rank";
    const improved = isRank ? metric.calculatedDelta > 0 : metric.calculatedDelta > 0;
    direction = metric.calculatedDelta === 0 ? "neutral" : improved ? "positive" : "negative";
    delta = `${metric.calculatedDelta > 0 ? "+" : ""}${metric.calculatedDelta} vs prior (${metric.previousValue})`;
  }

  return { value: formatValue(metric.value), label, delta, deltaDirection: direction };
}

/**
 * Only the mechanically-derivable sections are auto-populated here — the rest
 * (episode tables, ratings quotes, geography, cover copy) stay editor-entered
 * because they need human judgment or free text that isn't a straight metric
 * lookup. This is invoked by the editor's "restore generated version" action.
 */
export function generateMonthOverMonthSnapshot(
  metrics: ReportMetric[],
  observations: GeneratedObservation[],
): MonthOverMonthSnapshotContent | null {
  const downloads = calculateTotalDownloads(metrics);
  if (!downloads) return null;

  const stats: StatCardData[] = [
    {
      value: downloads.total.toLocaleString("en-US"),
      label: "Total downloads",
    },
    statFromMetric(metrics, METRIC_KEYS.APPLE_LISTENERS, "Apple listeners"),
    statFromMetric(metrics, METRIC_KEYS.SPOTIFY_RATINGS_COUNT, "Spotify ratings"),
    statFromMetric(metrics, METRIC_KEYS.APPLE_RATINGS_COUNT, "Apple ratings"),
    statFromMetric(metrics, METRIC_KEYS.APPLE_TOP50_KEYWORDS, "Apple search rankings"),
    statFromMetric(metrics, METRIC_KEYS.SPOTIFY_TOP50_KEYWORDS, "Spotify search rankings"),
    statFromMetric(metrics, METRIC_KEYS.SPOTIFY_PLAYS, "Spotify plays"),
    statFromMetric(metrics, METRIC_KEYS.APPLE_PLAYS, "Apple plays"),
  ].filter((s): s is StatCardData => s !== null);

  const snapshotObservation = observations.find((o) => o.ruleId === "rule_downloads_snapshot");
  const bugObservation = observations.find((o) => o.ruleId === "rule_apple_bug_context");

  return {
    stats,
    appleNote: bugObservation?.generatedText,
    whatThisMeans: snapshotObservation?.generatedText ?? "",
    sourceLine: "Spotify for Creators + Apple Podcasts Connect · Downloads = Apple Plays + Spotify Plays only",
  };
}

export function generateAudience(metrics: ReportMetric[]): AudienceContent | null {
  const genderKeys = [
    { key: METRIC_KEYS.SPOTIFY_GENDER_MALE, label: "Male" },
    { key: METRIC_KEYS.SPOTIFY_GENDER_FEMALE, label: "Female" },
    { key: METRIC_KEYS.SPOTIFY_GENDER_NOT_SPECIFIED, label: "Not Specified" },
  ];
  const gender = genderKeys
    .map(({ key, label }) => {
      const metric = findMetric(metrics, key);
      return metric && typeof metric.value === "number" ? { label, percent: metric.value } : null;
    })
    .filter((g): g is { label: string; percent: number } => g !== null);

  const age = metrics
    .filter((m) => m.metricKey.startsWith(METRIC_KEYS.SPOTIFY_AGE_BUCKET_PREFIX) && m.includedInReport)
    .map((m) => ({
      label: m.metricKey.replace(METRIC_KEYS.SPOTIFY_AGE_BUCKET_PREFIX, "").replace(/_/g, "-"),
      percent: typeof m.value === "number" ? m.value : 0,
    }));

  if (gender.length === 0 && age.length === 0) return null;

  const stats = [
    statFromMetric(metrics, METRIC_KEYS.APPLE_FOLLOWERS, "Apple followers"),
    statFromMetric(metrics, METRIC_KEYS.SPOTIFY_FOLLOWERS_NEW, "New Spotify followers"),
    statFromMetric(metrics, METRIC_KEYS.APPLE_LISTENERS, "Apple listeners"),
    statFromMetric(metrics, METRIC_KEYS.APPLE_TIME_LISTENED_HOURS, "Total listen time", (v) => `${v} hrs`),
  ].filter((s): s is StatCardData => s !== null);

  return {
    stats,
    gender,
    age,
    coreListenerNote: "",
    sourceLine: "Spotify for Creators — Audience Demographics (All-Time) · Apple Podcasts Connect — Overview",
  };
}

export function generateSearchVisibility(metrics: ReportMetric[]): SearchVisibilityContent | null {
  const stats = [
    statFromMetric(metrics, METRIC_KEYS.PODSEO_TOP50_TOTAL, "Total Top 50 results"),
    statFromMetric(metrics, METRIC_KEYS.APPLE_TOP50_KEYWORDS, "Apple Top 50 results"),
    statFromMetric(metrics, METRIC_KEYS.SPOTIFY_TOP50_KEYWORDS, "Spotify Top 50 results"),
    statFromMetric(metrics, METRIC_KEYS.PODSEO_VISIBILITY_SCORE, "Overall visibility score"),
  ].filter((s): s is StatCardData => s !== null);

  if (stats.length === 0) return null;

  return {
    stats,
    rankedNumberOne: [],
    primaryKeywords: [],
    secondaryKeywords: [],
    growingKeywords: [],
    brightSpotNote: "",
    sourceLine: "PodSEO — Organic Visibility + Keyword Tracker",
  };
}

/** Enforces the hard rule at generation time too, not just at validation: competitors always sorted best (lowest rank) first. */
export function sortCompetitors(content: CompetitorComparisonContent): CompetitorComparisonContent {
  return {
    ...content,
    competitors: [...content.competitors].sort((a, b) => a.visibilityRank - b.visibilityRank),
  };
}

export { rankDirection };
