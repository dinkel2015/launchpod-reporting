import { METRIC_KEYS } from "@/types/metrics";
import type { EpisodeContextEntry, GeneratedObservation, Rule, RuleInput } from "./types";

const LENGTH_VARIANCE_THRESHOLD_MINUTES = 8;
const DEFAULT_LENGTH_METRIC_KEY = "episode_length_minutes";

function stdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export type EpisodeLengthConsistency = {
  consistent: boolean;
  stdDevMinutes: number | null;
};

/**
 * Length VARIANCE across episodes is the concerning signal, not length itself — a
 * consistently long show is fine; a show that swings wildly episode to episode makes
 * completion-rate comparisons noisy and points at structure, not "shorten every episode."
 */
export function assessEpisodeLengthConsistency(
  episodeContext: EpisodeContextEntry[] | undefined,
  lengthMetricKey: string = DEFAULT_LENGTH_METRIC_KEY,
): EpisodeLengthConsistency {
  if (!episodeContext || episodeContext.length < 2) return { consistent: true, stdDevMinutes: null };

  const lengths = episodeContext
    .map((entry) => entry.metrics[lengthMetricKey])
    .filter((value): value is number => typeof value === "number");
  if (lengths.length < 2) return { consistent: true, stdDevMinutes: null };

  const sd = stdDev(lengths);
  return { consistent: sd <= LENGTH_VARIANCE_THRESHOLD_MINUTES, stdDevMinutes: sd };
}

export const completionRateRule: Rule = {
  id: "rule_completion_rate_context",
  appliesTo: (input: RuleInput) =>
    input.metrics.some(
      (m) => m.metricKey === METRIC_KEYS.SPOTIFY_COMPLETION_RATE && m.verificationStatus === "verified",
    ),
  generate: (input: RuleInput): GeneratedObservation[] => {
    const metric = input.metrics.find(
      (m) => m.metricKey === METRIC_KEYS.SPOTIFY_COMPLETION_RATE && m.verificationStatus === "verified",
    );
    if (!metric || typeof metric.value !== "number") return [];

    const { consistent, stdDevMinutes } = assessEpisodeLengthConsistency(input.episodeContext);

    let generatedText: string;
    if (!consistent && stdDevMinutes !== null) {
      generatedText = `Average completion rate is ${metric.value.toFixed(1)}%. Episode length varies by roughly ${stdDevMinutes.toFixed(0)} minutes across recent episodes, which is a more likely driver of completion swings than normal drop-off at a scripted outro. A more predictable episode structure and length would be worth prioritizing over shortening every episode.`;
    } else {
      generatedText = `Average completion rate is ${metric.value.toFixed(1)}%. Drop-off around a consistent, scripted outro is expected and is not itself a sign of a content problem.`;
    }

    return [
      {
        reportId: input.reportId,
        sourceType: "spotify",
        metricKey: METRIC_KEYS.SPOTIFY_COMPLETION_RATE,
        ruleId: "rule_completion_rate_context",
        generatedText,
        displayOrder: 0,
      },
    ];
  },
};
