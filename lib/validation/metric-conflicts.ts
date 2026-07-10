import type { ReportMetric } from "@/types/metrics";
import type { ValidationResult } from "./types";

export type MetricConflictsInput = {
  metrics: ReportMetric[];
};

export function checkMetricConflicts(input: MetricConflictsInput): ValidationResult {
  const checkId = "metric-conflicts";
  const label = "No conflicting metrics are included in the report";

  const conflicts = input.metrics.filter(
    (m) => m.includedInReport && m.verificationStatus === "conflict"
  );

  if (conflicts.length === 0) {
    return { checkId, label, passed: true, severity: "blocking", message: "" };
  }

  return {
    checkId,
    label,
    passed: false,
    severity: "blocking",
    message: `${conflicts.length} included metric(s) have unresolved conflicts: ${conflicts
      .map((m) => m.metricKey)
      .join(", ")}.`,
    details: {
      conflictMetricIds: conflicts.map((m) => m.id),
      conflictMetricKeys: conflicts.map((m) => m.metricKey),
    },
  };
}
