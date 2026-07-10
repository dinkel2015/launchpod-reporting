import type { AuthorityLevel, ReportMetric } from "@/types/metrics";
import type { ValidationResult } from "./types";

const GENDER_PREFIX = "spotify_gender_";
const AGE_PREFIX = "spotify_age_";

const ALLOWED_DEMOGRAPHIC_AUTHORITY: AuthorityLevel[] = [
  "authoritative_csv",
  "verified_screenshot",
  "manual_verified",
];

function isDemographicMetric(m: ReportMetric): boolean {
  return m.metricKey.startsWith(GENDER_PREFIX) || m.metricKey.startsWith(AGE_PREFIX);
}

export type DemographicsSourcingInput = {
  metrics: ReportMetric[];
};

export function checkDemographicsSourcing(input: DemographicsSourcingInput): ValidationResult {
  const checkId = "demographics-sourcing";
  const label = "Demographics figures are properly sourced and key-independent";

  const demographicMetrics = input.metrics.filter(isDemographicMetric);

  const badAuthority = demographicMetrics.filter(
    (m) => !ALLOWED_DEMOGRAPHIC_AUTHORITY.includes(m.authorityLevel)
  );

  // A combined "gender_and_age" style key would make the two dimensions impossible
  // to independently verify or correct — each must be its own metric key.
  const crossKeyed = input.metrics.filter(
    (m) => m.metricKey.includes("gender") && m.metricKey.includes("age")
  );

  if (badAuthority.length === 0 && crossKeyed.length === 0) {
    return { checkId, label, passed: true, severity: "blocking", message: "" };
  }

  const parts: string[] = [];
  if (badAuthority.length > 0) {
    parts.push(
      `${badAuthority.length} demographic metric(s) lack an authoritative source: ${badAuthority
        .map((m) => `${m.metricKey} (${m.authorityLevel})`)
        .join(", ")}.`
    );
  }
  if (crossKeyed.length > 0) {
    parts.push(
      `${crossKeyed.length} metric key(s) combine gender and age into one key: ${crossKeyed
        .map((m) => m.metricKey)
        .join(", ")}.`
    );
  }

  return {
    checkId,
    label,
    passed: false,
    severity: "blocking",
    message: parts.join(" "),
    details: {
      badAuthorityMetricKeys: badAuthority.map((m) => m.metricKey),
      crossKeyedMetricKeys: crossKeyed.map((m) => m.metricKey),
    },
  };
}

export type DemographicsPercentageSumInput = {
  metrics: ReportMetric[];
};

const SUM_TOLERANCE = 1.5;

function numericValue(m: ReportMetric): number | null {
  if (m.value === null) return null;
  const num = typeof m.value === "string" ? Number(m.value) : m.value;
  return Number.isNaN(num) ? null : num;
}

function sumGroup(metrics: ReportMetric[], prefix: string): number | null {
  const group = metrics.filter((m) => m.metricKey.startsWith(prefix));
  if (group.length === 0) return null;
  let total = 0;
  for (const m of group) {
    const v = numericValue(m);
    if (v === null) return null;
    total += v;
  }
  return total;
}

export function checkDemographicsPercentageSums(
  input: DemographicsPercentageSumInput
): ValidationResult {
  const checkId = "demographics-percentage-sums";
  const label = "Demographic percentage buckets sum to ~100%";

  const genderSum = sumGroup(input.metrics, GENDER_PREFIX);
  const ageSum = sumGroup(input.metrics, AGE_PREFIX);

  const problems: string[] = [];
  if (genderSum !== null && Math.abs(genderSum - 100) > SUM_TOLERANCE) {
    problems.push(`gender buckets sum to ${genderSum}%`);
  }
  if (ageSum !== null && Math.abs(ageSum - 100) > SUM_TOLERANCE) {
    problems.push(`age buckets sum to ${ageSum}%`);
  }

  // Sanity-check only — small rounding drift across platform exports is expected,
  // so this is a warning rather than a publish blocker.
  if (problems.length === 0) {
    return { checkId, label, passed: true, severity: "warning", message: "" };
  }

  return {
    checkId,
    label,
    passed: false,
    severity: "warning",
    message: `Demographic percentages do not sum to ~100%: ${problems.join("; ")}.`,
    details: { genderSum, ageSum },
  };
}
