import type { ReportMetric } from "@/types/metrics";
import type { ValidationResult } from "./types";

export type RankDirectionInput = {
  metrics: ReportMetric[];
};

function toNumber(v: number | string | null): number | null {
  if (v === null) return null;
  const num = typeof v === "string" ? Number(v) : v;
  return Number.isNaN(num) ? null : num;
}

function sign(n: number): -1 | 0 | 1 {
  if (n > 0) return 1;
  if (n < 0) return -1;
  return 0;
}

export function checkRankDirection(input: RankDirectionInput): ValidationResult {
  const checkId = "rank-direction";
  const label = "Rank deltas follow lower-is-better direction";

  const inverted: Array<{
    metricKey: string;
    value: number;
    previousValue: number;
    calculatedDelta: number;
    expectedDelta: number;
  }> = [];

  for (const m of input.metrics) {
    if (m.unit !== "rank") continue;
    const value = toNumber(m.value);
    const previousValue = m.previousValue;
    if (value === null || previousValue === null || m.calculatedDelta === null) continue;

    const expectedDelta = previousValue - value;
    if (sign(m.calculatedDelta) !== sign(expectedDelta)) {
      inverted.push({
        metricKey: m.metricKey,
        value,
        previousValue,
        calculatedDelta: m.calculatedDelta,
        expectedDelta,
      });
    }
  }

  if (inverted.length === 0) {
    return { checkId, label, passed: true, severity: "blocking", message: "" };
  }

  return {
    checkId,
    label,
    passed: false,
    severity: "blocking",
    message: `${inverted.length} rank metric(s) have a calculatedDelta inconsistent with lower-is-better direction: ${inverted
      .map((i) => i.metricKey)
      .join(", ")}.`,
    details: { inverted },
  };
}
