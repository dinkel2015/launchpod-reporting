import { METRIC_KEYS } from "@/types/metrics";
import type { ReportMetric } from "@/types/metrics";
import type { GeneratedObservation, Rule, RuleInput } from "./types";

export type ReachEvidence = {
  listenerGrowth?: boolean;
  impressionGrowth?: boolean;
  newMarkets?: boolean;
  followerGrowth?: boolean;
  newDiscoverySources?: boolean;
};

/**
 * A single positive metric is never enough to claim broader (geographic/national/
 * international) reach — at least two independent signals must agree.
 */
export function canClaimBroaderReach(evidence: ReachEvidence): boolean {
  const flags = [
    evidence.listenerGrowth,
    evidence.impressionGrowth,
    evidence.newMarkets,
    evidence.followerGrowth,
    evidence.newDiscoverySources,
  ];
  return flags.filter(Boolean).length >= 2;
}

function hasPositiveDelta(metrics: ReportMetric[], key: string): boolean {
  const metric = metrics.find((m) => m.metricKey === key && m.verificationStatus === "verified");
  return !!metric && metric.calculatedDelta !== null && metric.calculatedDelta > 0;
}

function hasNewGeoMarket(metrics: ReportMetric[]): boolean {
  return metrics.some(
    (m) =>
      m.metricKey.startsWith(METRIC_KEYS.SPOTIFY_GEO_COUNTRY_PREFIX) &&
      m.verificationStatus === "verified" &&
      m.previousValue === null &&
      typeof m.value === "number" &&
      m.value > 0,
  );
}

export function deriveReachEvidence(metrics: ReportMetric[]): ReachEvidence {
  return {
    listenerGrowth: hasPositiveDelta(metrics, METRIC_KEYS.APPLE_LISTENERS),
    impressionGrowth: hasPositiveDelta(metrics, METRIC_KEYS.SPOTIFY_IMPRESSIONS),
    newMarkets: hasNewGeoMarket(metrics),
    followerGrowth:
      hasPositiveDelta(metrics, METRIC_KEYS.APPLE_FOLLOWERS) ||
      hasPositiveDelta(metrics, METRIC_KEYS.SPOTIFY_FOLLOWERS_TOTAL) ||
      hasPositiveDelta(metrics, METRIC_KEYS.SPOTIFY_FOLLOWERS_NEW),
    newDiscoverySources:
      hasPositiveDelta(metrics, METRIC_KEYS.SPOTIFY_DISCOVERY_SEARCH) ||
      hasPositiveDelta(metrics, METRIC_KEYS.SPOTIFY_DISCOVERY_HOME) ||
      hasPositiveDelta(metrics, METRIC_KEYS.SPOTIFY_DISCOVERY_LIBRARY),
  };
}

const REACH_RELATED_METRIC_KEYS: readonly string[] = [
  METRIC_KEYS.APPLE_LISTENERS,
  METRIC_KEYS.SPOTIFY_IMPRESSIONS,
  METRIC_KEYS.APPLE_FOLLOWERS,
  METRIC_KEYS.SPOTIFY_FOLLOWERS_TOTAL,
  METRIC_KEYS.SPOTIFY_FOLLOWERS_NEW,
  METRIC_KEYS.SPOTIFY_DISCOVERY_SEARCH,
  METRIC_KEYS.SPOTIFY_DISCOVERY_HOME,
  METRIC_KEYS.SPOTIFY_DISCOVERY_LIBRARY,
];

export const reachClaimRule: Rule = {
  id: "rule_reach_claim",
  appliesTo: (input: RuleInput) =>
    input.metrics.some((m) => REACH_RELATED_METRIC_KEYS.includes(m.metricKey) && m.verificationStatus === "verified"),
  generate: (input: RuleInput): GeneratedObservation[] => {
    const evidence = deriveReachEvidence(input.metrics);

    let generatedText: string;
    if (!canClaimBroaderReach(evidence)) {
      // Insufficient independent evidence: stay narrow, never "expanding internationally/nationally."
      generatedText = "More people listened this month.";
    } else if (evidence.newMarkets) {
      generatedText =
        "Listening grew alongside new market activity and other independent signals this period, consistent with broader reach.";
    } else {
      generatedText =
        "Multiple independent signals — listening, impressions, and engagement — moved together this period, consistent with broader reach.";
    }

    return [
      {
        reportId: input.reportId,
        sourceType: "cross_platform",
        metricKey: METRIC_KEYS.APPLE_LISTENERS,
        ruleId: "rule_reach_claim",
        generatedText,
        displayOrder: 0,
      },
    ];
  },
};
