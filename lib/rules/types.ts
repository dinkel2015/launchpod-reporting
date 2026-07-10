import type { ReportMetric } from "@/types/metrics";
import type { ReportObservation } from "@/types/report";

export type EpisodeContextEntry = {
  label: string;
  metrics: Record<string, number>;
};

export type RuleInput = {
  reportId: string;
  /**
   * Only verification_status === "verified" metrics should ever reach rules
   * that produce client-facing text. runRuleEngine re-filters defensively so
   * individual rules don't have to trust the caller.
   */
  metrics: ReportMetric[];
  humanContext: string | null;
  episodesPublishedThisMonth: number;
  expectedEpisodeFrequency: number | null;
  /** Most-recent-first, for rolling-average rules. */
  previousReportsMetrics?: ReportMetric[][];
  /** Report-level flag: was the Apple undercounting bug flagged for this reporting period? */
  appleBugNotedThisMonth?: boolean;
  /** Optional episode-level tagging, kept generic/optional since it isn't strictly typed yet. */
  episodeContext?: EpisodeContextEntry[];
};

export type GeneratedObservation = Omit<ReportObservation, "id" | "editedText" | "includedInReport">;

export type Rule = {
  id: string;
  appliesTo: (input: RuleInput) => boolean;
  generate: (input: RuleInput) => GeneratedObservation[];
};
