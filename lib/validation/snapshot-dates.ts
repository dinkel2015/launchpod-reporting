import type { ReportMetric } from "@/types/metrics";
import type { ValidationResult } from "./types";

export type SnapshotDatesInput = {
  metrics: ReportMetric[];
  reportingPeriodEnd: string;
  confirmedSameDayCapture?: Set<string>;
};

function requiresSnapshotDate(m: ReportMetric): boolean {
  return m.sourcePlatform === "podseo" || m.authorityLevel === "verified_screenshot";
}

export function checkSnapshotDates(input: SnapshotDatesInput): ValidationResult {
  const checkId = "snapshot-dates";
  const label = "Delayed/manual captures carry an honest snapshot date";
  const confirmed = input.confirmedSameDayCapture ?? new Set<string>();

  const missing: string[] = [];
  const unconfirmedSameDay: string[] = [];

  for (const m of input.metrics) {
    if (!requiresSnapshotDate(m)) continue;

    if (!m.snapshotDate) {
      missing.push(m.metricKey);
      continue;
    }

    // A podseo/screenshot capture that happens to land exactly on the report's
    // period-end date is plausible but also the classic symptom of a pipeline
    // defaulting a delayed pull to "today" — require explicit confirmation.
    if (m.snapshotDate === input.reportingPeriodEnd && !confirmed.has(m.id)) {
      unconfirmedSameDay.push(m.metricKey);
    }
  }

  if (missing.length === 0 && unconfirmedSameDay.length === 0) {
    return { checkId, label, passed: true, severity: "blocking", message: "" };
  }

  const parts: string[] = [];
  if (missing.length > 0) {
    parts.push(`${missing.length} metric(s) missing a snapshot date: ${missing.join(", ")}.`);
  }
  if (unconfirmedSameDay.length > 0) {
    parts.push(
      `${unconfirmedSameDay.length} metric(s) have a snapshot date equal to the reporting period end and are not confirmed as same-day captures: ${unconfirmedSameDay.join(", ")}.`
    );
  }

  return {
    checkId,
    label,
    passed: false,
    severity: "blocking",
    message: parts.join(" "),
    details: { missingSnapshotDateKeys: missing, unconfirmedSameDayKeys: unconfirmedSameDay },
  };
}
