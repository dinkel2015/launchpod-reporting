import { METRIC_KEYS } from "@/types/metrics";
import type { GeneratedObservation, Rule, RuleInput } from "./types";

export type RankDirection = "improved" | "declined" | "unchanged";

/** PodSEO visibility rank: lower number = better position. Never apply "higher is better." */
export function rankDirection(current: number, previous: number): RankDirection {
  if (current < previous) return "improved";
  if (current > previous) return "declined";
  return "unchanged";
}

/** 7-day trend arrow convention: up-arrow = improvement = rank number decreasing. */
export function trendArrow(direction: RankDirection): "up" | "down" | "flat" {
  if (direction === "improved") return "up";
  if (direction === "declined") return "down";
  return "flat";
}

export const rankMovementRule: Rule = {
  id: "rule_rank_movement",
  appliesTo: (input: RuleInput) =>
    input.metrics.some(
      (m) => m.metricKey === METRIC_KEYS.PODSEO_VISIBILITY_RANK && m.verificationStatus === "verified",
    ),
  generate: (input: RuleInput): GeneratedObservation[] => {
    const metric = input.metrics.find(
      (m) => m.metricKey === METRIC_KEYS.PODSEO_VISIBILITY_RANK && m.verificationStatus === "verified",
    );
    if (!metric || typeof metric.value !== "number" || metric.previousValue === null) return [];

    const current = metric.value;
    const previous = metric.previousValue;
    const direction = rankDirection(current, previous);

    let generatedText: string;
    if (direction === "improved") {
      generatedText = `Visibility rank improved from #${previous} to #${current}.`;
    } else if (direction === "declined") {
      generatedText = `Visibility rank declined from #${previous} to #${current}.`;
    } else {
      generatedText = `Visibility rank held steady at #${current}.`;
    }

    return [
      {
        reportId: input.reportId,
        sourceType: "podseo",
        metricKey: METRIC_KEYS.PODSEO_VISIBILITY_RANK,
        ruleId: "rule_rank_movement",
        generatedText,
        displayOrder: 0,
      },
    ];
  },
};
