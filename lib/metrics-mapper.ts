import type { ReportMetric } from "@/types/metrics";
import type { Database } from "@/types/database";

type MetricRow = Database["public"]["Tables"]["report_metrics"]["Row"];

/**
 * report_metrics.value is stored as text (it can hold "Not Charting" as
 * easily as "342"), but the rule engine and validators want a real number
 * wherever the unit implies one — this is the one place that coercion happens.
 */
function coerceValue(row: MetricRow): number | string | null {
  if (row.value === null) return null;
  if (row.unit === "count" || row.unit === "percent" || row.unit === "rank" || row.unit === "score" || row.unit === "minutes" || row.unit === "hours") {
    const numeric = Number(row.value.replace(/,/g, ""));
    if (!Number.isNaN(numeric)) return numeric;
  }
  return row.value;
}

export function dbRowToReportMetric(row: MetricRow): ReportMetric {
  return {
    id: row.id,
    reportId: row.report_id,
    sourcePlatform: row.source_type,
    uploadId: row.upload_id,
    metricKey: row.metric_key,
    originalLabel: row.original_label,
    displayLabel: row.display_label,
    value: coerceValue(row),
    previousValue: row.previous_value,
    calculatedDelta: row.calculated_delta,
    unit: row.unit,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    snapshotDate: row.snapshot_date,
    authorityLevel: row.authority_level,
    verificationStatus: row.verification_status,
    sourcePage: row.source_page,
    sourceReference: row.source_reference,
    manuallyAdjusted: row.manually_adjusted,
    includedInReport: row.included_in_report,
    notes: row.notes,
  };
}
