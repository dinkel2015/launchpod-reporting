import type { ReportMetric } from "@/types/metrics";
import type { GeneratedObservation, Rule, RuleInput } from "./types";
import { downloadsSnapshotRule } from "./downloads";
import { appleBugContextRule } from "./apple-bug-guard";
import { rankMovementRule } from "./podseo-rank";
import { chartRankingsRule } from "./chart-rankings";
import { lowEpisodeCountRule } from "./low-episode-count";
import { guestInterpretationRule } from "./guest-interpretation";
import { reachClaimRule } from "./reach-claims";
import { completionRateRule } from "./completion-rate";

const REGISTERED_RULES: Rule[] = [
  downloadsSnapshotRule,
  appleBugContextRule,
  rankMovementRule,
  chartRankingsRule,
  lowEpisodeCountRule,
  guestInterpretationRule,
  reachClaimRule,
  completionRateRule,
];

function onlyVerified(metrics: ReportMetric[]): ReportMetric[] {
  return metrics.filter((m) => m.verificationStatus === "verified");
}

/**
 * Defense in depth: even though RuleInput.metrics is documented as verified-only, the
 * engine re-filters here so a rule file can never accidentally generate client-facing
 * text from an unverified/conflicting metric because a caller forgot to filter upstream.
 */
function toVerifiedInput(rawInput: RuleInput): RuleInput {
  return {
    ...rawInput,
    metrics: onlyVerified(rawInput.metrics),
    previousReportsMetrics: rawInput.previousReportsMetrics?.map(onlyVerified),
  };
}

export function runRuleEngine(rawInput: RuleInput): GeneratedObservation[] {
  const input = toVerifiedInput(rawInput);

  const observations: GeneratedObservation[] = [];
  for (const rule of REGISTERED_RULES) {
    if (!rule.appliesTo(input)) continue;
    observations.push(...rule.generate(input));
  }

  return observations.map((observation, index) => ({ ...observation, displayOrder: index }));
}

export { REGISTERED_RULES };
