import { calculateTotalDownloads } from "@/lib/rules/downloads";
import { METRIC_KEYS } from "@/types/metrics";
import type { ReportMetric } from "@/types/metrics";
import type { ValidationResult } from "./types";

export type DownloadsReconcileInput = {
  metrics: ReportMetric[];
};

function numericValue(metric: ReportMetric | undefined): number | null {
  if (!metric || metric.value === null) return null;
  const num = typeof metric.value === "string" ? Number(metric.value) : metric.value;
  return Number.isNaN(num) ? null : num;
}

export function checkDownloadsReconcile(input: DownloadsReconcileInput): ValidationResult {
  const checkId = "downloads-reconcile";
  const label = "Total downloads reconcile with Apple + Spotify plays";

  const displayedMetric = input.metrics.find(
    (m) => m.metricKey === METRIC_KEYS.TOTAL_DOWNLOADS && m.includedInReport
  );
  const displayedDownloads = numericValue(displayedMetric);
  const calculated = calculateTotalDownloads(input.metrics);

  if (calculated === null || displayedDownloads === null) {
    return {
      checkId,
      label,
      passed: false,
      severity: "blocking",
      message: "Missing verified Apple Plays, verified Spotify Plays, or a displayed Total Downloads metric — cannot reconcile.",
      details: {
        applePlays: calculated?.applePlays ?? null,
        spotifyPlays: calculated?.spotifyPlays ?? null,
        calculatedDownloads: calculated?.total ?? null,
        displayedDownloads,
      },
    };
  }

  const passed = calculated.total === displayedDownloads;

  const details = {
    applePlays: calculated.applePlays,
    spotifyPlays: calculated.spotifyPlays,
    calculatedDownloads: calculated.total,
    displayedDownloads,
  };

  if (passed) {
    return {
      checkId,
      label,
      passed: true,
      severity: "blocking",
      message: "",
      details,
    };
  }

  return {
    checkId,
    label,
    passed: false,
    severity: "blocking",
    message: "Displayed Total Downloads must equal Apple Plays + Spotify Plays.",
    details,
  };
}
