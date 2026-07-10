import { METRIC_KEYS } from "@/types/metrics";
import type { ReportMetric } from "@/types/metrics";
import type { GeneratedObservation, Rule, RuleInput } from "./types";

const LOW_EPISODE_THRESHOLD = 2;
const VERY_LOW_EPISODE_THRESHOLD = 1;

export type TrendWindow = "single_month" | "rolling_quarter" | "six_month";

/**
 * Fewer episodes this month means less signal in a single-month comparison, so the
 * engine should lean on a longer trend window instead of a strong single-month claim.
 */
export function preferredTrendWindow(episodesPublishedThisMonth: number): TrendWindow {
  if (episodesPublishedThisMonth > LOW_EPISODE_THRESHOLD) return "single_month";
  if (episodesPublishedThisMonth <= VERY_LOW_EPISODE_THRESHOLD) return "six_month";
  return "rolling_quarter";
}

function average(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}

function metricValuesForKey(reportsMetrics: ReportMetric[][], metricKey: string, windowSize: number): number[] {
  const values: number[] = [];
  for (const reportMetrics of reportsMetrics.slice(0, windowSize)) {
    const metric = reportMetrics.find((m) => m.metricKey === metricKey && m.verificationStatus === "verified");
    if (metric && typeof metric.value === "number") values.push(metric.value);
  }
  return values;
}

/** Rolling average of a metric across the most recent N prior reports (most-recent-first). */
export function computeRollingAverage(
  previousReportsMetrics: ReportMetric[][] | undefined,
  metricKey: string,
  windowSize: number,
): number | null {
  if (!previousReportsMetrics || previousReportsMetrics.length === 0) return null;
  const values = metricValuesForKey(previousReportsMetrics, metricKey, windowSize);
  if (values.length === 0) return null;
  return average(values);
}

export function computeQuarterlyAverage(
  previousReportsMetrics: ReportMetric[][] | undefined,
  metricKey: string,
): number | null {
  return computeRollingAverage(previousReportsMetrics, metricKey, 3);
}

export function computeSixMonthAverage(
  previousReportsMetrics: ReportMetric[][] | undefined,
  metricKey: string,
): number | null {
  return computeRollingAverage(previousReportsMetrics, metricKey, 6);
}

export const lowEpisodeCountRule: Rule = {
  id: "rule_low_episode_count_context",
  appliesTo: (input: RuleInput) => input.episodesPublishedThisMonth <= LOW_EPISODE_THRESHOLD,
  generate: (input: RuleInput): GeneratedObservation[] => {
    const window = preferredTrendWindow(input.episodesPublishedThisMonth);
    const windowLabel = window === "six_month" ? "six-month" : "quarterly";
    const episodeWord = input.episodesPublishedThisMonth === 1 ? "episode" : "episodes";

    // Hedge, don't refuse: still surface the month's data, just anchored to a longer window.
    const generatedText = `Only ${input.episodesPublishedThisMonth} ${episodeWord} published this month, so this month's change should be read alongside the ${windowLabel} trend rather than in isolation.`;

    return [
      {
        reportId: input.reportId,
        sourceType: "editorial",
        metricKey: METRIC_KEYS.TOTAL_DOWNLOADS,
        ruleId: "rule_low_episode_count_context",
        generatedText,
        displayOrder: 0,
      },
    ];
  },
};
