import { METRIC_KEYS } from "@/types/metrics";
import type { ReportMetric } from "@/types/metrics";
import type { GeneratedObservation, Rule, RuleInput } from "./types";

export type DownloadsTotal = {
  total: number;
  applePlays: number;
  spotifyPlays: number;
};

function findVerifiedNumericMetric(metrics: ReportMetric[], key: string): ReportMetric | null {
  const metric = metrics.find((m) => m.metricKey === key);
  if (!metric) return null;
  if (metric.verificationStatus !== "verified") return null;
  if (typeof metric.value !== "number") return null;
  return metric;
}

/**
 * Hard rule: Total Downloads = Apple Plays + Spotify Plays, and ONLY those two.
 * Never fold in hosting/spreaker/podseo numbers — different methodologies, would double count.
 * Returns null (rather than a partial/estimated total) if either input is missing or unverified,
 * because this function backs both the report copy AND the publish-blocking validator.
 */
export function calculateTotalDownloads(metrics: ReportMetric[]): DownloadsTotal | null {
  const apple = findVerifiedNumericMetric(metrics, METRIC_KEYS.APPLE_PLAYS);
  const spotify = findVerifiedNumericMetric(metrics, METRIC_KEYS.SPOTIFY_PLAYS);
  if (!apple || !spotify) return null;

  const applePlays = apple.value as number;
  const spotifyPlays = spotify.value as number;
  return { total: applePlays + spotifyPlays, applePlays, spotifyPlays };
}

function describeChange(current: number, previous: number | null): string {
  const currentText = current.toLocaleString("en-US");
  if (previous === null) {
    return `Total downloads (Apple plays + Spotify plays) were ${currentText} this period.`;
  }

  const previousText = previous.toLocaleString("en-US");
  const delta = current - previous;
  if (delta === 0) {
    return `Total downloads held steady at ${currentText}, unchanged from the prior period.`;
  }

  const direction = delta > 0 ? "increased" : "decreased";
  const pctText = previous !== 0 ? ` (${Math.abs((delta / previous) * 100).toFixed(0)}%)` : "";
  return `Total downloads ${direction} to ${currentText} from ${previousText}${pctText}, combining Apple and Spotify plays.`;
}

export const downloadsSnapshotRule: Rule = {
  id: "rule_downloads_snapshot",
  appliesTo: (input: RuleInput) => calculateTotalDownloads(input.metrics) !== null,
  generate: (input: RuleInput): GeneratedObservation[] => {
    const current = calculateTotalDownloads(input.metrics);
    if (!current) return [];

    const previousMetrics = input.previousReportsMetrics?.[0] ?? null;
    const previousTotals = previousMetrics ? calculateTotalDownloads(previousMetrics) : null;
    const generatedText = describeChange(current.total, previousTotals?.total ?? null);

    return [
      {
        reportId: input.reportId,
        sourceType: "cross_platform",
        metricKey: METRIC_KEYS.TOTAL_DOWNLOADS,
        ruleId: "rule_downloads_snapshot",
        generatedText,
        displayOrder: 0,
      },
    ];
  },
};
