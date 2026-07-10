import type { ReportMetric } from "@/types/metrics";
import type { ValidationResult } from "./types";

export type SourceReferencesInput = {
  metrics: ReportMetric[];
};

export function checkSourceReferences(input: SourceReferencesInput): ValidationResult {
  const checkId = "source-references";
  const label = "Every figure has a source reference";

  const missing = input.metrics.filter(
    (m) => m.includedInReport && (!m.sourceReference || m.sourceReference.trim() === "")
  );

  if (missing.length === 0) {
    return { checkId, label, passed: true, severity: "blocking", message: "" };
  }

  return {
    checkId,
    label,
    passed: false,
    severity: "blocking",
    message: `${missing.length} included metric(s) are missing a source reference: ${missing
      .map((m) => m.metricKey)
      .join(", ")}.`,
    details: {
      missingMetricIds: missing.map((m) => m.id),
      missingMetricKeys: missing.map((m) => m.metricKey),
    },
  };
}
