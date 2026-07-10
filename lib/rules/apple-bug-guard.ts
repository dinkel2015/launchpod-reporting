import { METRIC_KEYS } from "@/types/metrics";
import type { GeneratedObservation, Rule, RuleInput } from "./types";

/** Metrics the known Apple playback-tracking bug can plausibly undercount. */
const APPLE_BUG_ELIGIBLE_METRIC_KEYS: readonly string[] = [
  METRIC_KEYS.APPLE_PLAYS,
  METRIC_KEYS.APPLE_ENGAGED_LISTENERS,
  METRIC_KEYS.APPLE_CONSUMPTION_RATE,
];

/**
 * The bug only ever undercounts Apple — it can never explain a Spotify anomaly
 * (different platform, different pipeline) or an Apple number that came in
 * HIGHER than expected (an undercounting bug cannot produce inflated numbers).
 */
export function explainAppleAnomaly(
  metricKey: string,
  direction: "up" | "down",
  platform: "apple" | "spotify",
): string | null {
  if (platform !== "apple") return null;
  if (direction !== "down") return null;
  if (!APPLE_BUG_ELIGIBLE_METRIC_KEYS.includes(metricKey)) return null;

  return "Apple's known playback-tracking bug undercounts plays, engaged listeners, and consumption rate, which may be contributing to this figure reading lower than actual listening activity.";
}

function metricLabelFor(metricKey: string): string {
  switch (metricKey) {
    case METRIC_KEYS.APPLE_PLAYS:
      return "Apple plays";
    case METRIC_KEYS.APPLE_ENGAGED_LISTENERS:
      return "Apple engaged listeners";
    case METRIC_KEYS.APPLE_CONSUMPTION_RATE:
      return "Apple average consumption rate";
    default:
      return metricKey;
  }
}

/**
 * Only fires when the report explicitly flags the bug for this month — this is
 * calibrated context tied to a real, confirmed anomaly, not a blanket disclaimer
 * attached to every Apple metric every month.
 */
export const appleBugContextRule: Rule = {
  id: "rule_apple_bug_context",
  appliesTo: (input: RuleInput) => input.appleBugNotedThisMonth === true,
  generate: (input: RuleInput): GeneratedObservation[] => {
    if (!input.appleBugNotedThisMonth) return [];

    const observations: GeneratedObservation[] = [];
    for (const key of APPLE_BUG_ELIGIBLE_METRIC_KEYS) {
      const metric = input.metrics.find((m) => m.metricKey === key && m.verificationStatus === "verified");
      if (!metric || typeof metric.value !== "number" || metric.calculatedDelta === null) continue;
      if (metric.calculatedDelta === 0) continue;

      const label = metricLabelFor(key);
      let generatedText: string;
      if (metric.calculatedDelta < 0) {
        const explanation = explainAppleAnomaly(key, "down", "apple");
        generatedText = `${label} came in lower this period. ${explanation ?? ""}`.trim();
      } else {
        // Rising despite a flagged undercounting bug: never credit the bug with the increase.
        generatedText = `${label} rose this period despite the known Apple undercounting bug being flagged this month, so the result appears real and may even be conservative.`;
      }

      observations.push({
        reportId: input.reportId,
        sourceType: "apple",
        metricKey: key,
        ruleId: "rule_apple_bug_context",
        generatedText,
        displayOrder: 0,
      });
    }
    return observations;
  },
};
