import type { ReportMetric } from "@/types/metrics";
import type { ValidationResult } from "./types";

export type MetricsVerifiedInput = {
  metrics: ReportMetric[];
};

export function checkMetricsVerified(input: MetricsVerifiedInput): ValidationResult {
  const checkId = "metrics-verified";
  const label = "Client-facing figures are verified";

  const unverified = input.metrics.filter(
    (m) => m.includedInReport && m.verificationStatus !== "verified"
  );

  if (unverified.length === 0) {
    return { checkId, label, passed: true, severity: "blocking", message: "" };
  }

  return {
    checkId,
    label,
    passed: false,
    severity: "blocking",
    message: `${unverified.length} included metric(s) are not verified: ${unverified
      .map((m) => `${m.metricKey} (${m.verificationStatus})`)
      .join(", ")}.`,
    details: {
      unverifiedMetricIds: unverified.map((m) => m.id),
      unverifiedMetricKeys: unverified.map((m) => m.metricKey),
    },
  };
}
