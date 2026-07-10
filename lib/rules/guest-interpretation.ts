import type { EpisodeContextEntry, GeneratedObservation, Rule, RuleInput } from "./types";

export type EpisodeGroupComparison = {
  metricKey: string;
  groupALabel: string;
  groupBLabel: string;
  groupAAverage: number;
  groupBAverage: number;
  differencePct: number;
};

const PATTERN_DIFFERENCE_THRESHOLD_PCT = 15;

// Generic heuristic since episode-level tagging isn't strictly typed yet: labels that
// read as "compilation"/"solo"/"recap" episodes vs. everything else (treated as
// recognizable-guest/organization episodes).
const COMPILATION_LABEL_PATTERN = /compilation|solo|recap/i;

function average(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}

function isCompilationLabel(label: string): boolean {
  return COMPILATION_LABEL_PATTERN.test(label);
}

export function compareEpisodeGroups(
  episodeContext: EpisodeContextEntry[],
  metricKey: string,
): EpisodeGroupComparison | null {
  const recognizable: number[] = [];
  const compilation: number[] = [];

  for (const entry of episodeContext) {
    const value = entry.metrics[metricKey];
    if (typeof value !== "number") continue;
    if (isCompilationLabel(entry.label)) compilation.push(value);
    else recognizable.push(value);
  }

  if (recognizable.length === 0 || compilation.length === 0) return null;

  const groupAAverage = average(recognizable);
  const groupBAverage = average(compilation);
  if (groupBAverage === 0) return null;

  return {
    metricKey,
    groupALabel: "episodes tied to recognizable organizations",
    groupBLabel: "compilation episodes",
    groupAAverage,
    groupBAverage,
    differencePct: ((groupAAverage - groupBAverage) / groupBAverage) * 100,
  };
}

/**
 * Never emits a directive ("book more guests like X") — only an observation to keep
 * tracking, per house editorial policy. Direction-aware so it never overstates which
 * group is ahead.
 */
export const guestInterpretationRule: Rule = {
  id: "rule_guest_pattern_observation",
  appliesTo: (input: RuleInput) => (input.episodeContext?.length ?? 0) >= 2,
  generate: (input: RuleInput): GeneratedObservation[] => {
    const episodeContext = input.episodeContext;
    if (!episodeContext) return [];

    const candidateKeys = new Set<string>();
    for (const entry of episodeContext) {
      for (const key of Object.keys(entry.metrics)) candidateKeys.add(key);
    }

    const observations: GeneratedObservation[] = [];
    for (const metricKey of candidateKeys) {
      const comparison = compareEpisodeGroups(episodeContext, metricKey);
      if (!comparison || Math.abs(comparison.differencePct) < PATTERN_DIFFERENCE_THRESHOLD_PCT) continue;

      const metricLabel = metricKey.replace(/_/g, " ");
      const generatedText =
        comparison.differencePct > 0
          ? `Episodes tied to recognizable organizations have tended to outperform compilation episodes on ${metricLabel}. Continue tracking whether that pattern holds.`
          : `Compilation episodes have tended to outperform episodes tied to recognizable organizations on ${metricLabel} this period. Continue tracking whether that pattern holds.`;

      observations.push({
        reportId: input.reportId,
        sourceType: "editorial",
        metricKey,
        ruleId: "rule_guest_pattern_observation",
        generatedText,
        displayOrder: 0,
      });
    }
    return observations;
  },
};
