import type { ValidationResult } from "./types";

export type ChartCurrentVsHistoricalInput = {
  // Assumed shape of the chart_rankings section's contentJson: it must expose
  // current placement and historical-peak placement as two distinct top-level
  // fields (key names are matched loosely by pattern, e.g. `currentStatus` /
  // `currentRank` vs `historicalPeak` / `peakRank`), rather than one blended
  // field/string that tries to represent both at once (e.g. a single
  // "rankSummary": "was #2, now #5" string). This lets the UI render them in
  // visually separated slots and prevents copy from conflating the two.
  chartRankingsContentJson: Record<string, unknown>;
};

const CURRENT_KEY_PATTERN = /current/i;
const HISTORICAL_KEY_PATTERN = /(historical|peak|prior|previous)/i;

export function checkChartCurrentVsHistorical(
  input: ChartCurrentVsHistoricalInput
): ValidationResult {
  const checkId = "chart-current-vs-historical";
  const label = "Current chart placement is structurally separated from historical peak";

  const keys = Object.keys(input.chartRankingsContentJson);
  const currentKeys = keys.filter((k) => CURRENT_KEY_PATTERN.test(k));
  const historicalKeys = keys.filter((k) => HISTORICAL_KEY_PATTERN.test(k));

  const hasDistinctCurrent = currentKeys.length > 0 && currentKeys[0] !== undefined;
  const hasDistinctHistorical = historicalKeys.length > 0;
  const overlapping = currentKeys.some((k) => historicalKeys.includes(k));

  if (hasDistinctCurrent && hasDistinctHistorical && !overlapping) {
    return { checkId, label, passed: true, severity: "blocking", message: "" };
  }

  return {
    checkId,
    label,
    passed: false,
    severity: "blocking",
    message:
      "Chart rankings content must have distinct fields for current placement and historical peak — they must not be blended into a single field.",
    details: { keys, currentKeys, historicalKeys },
  };
}
