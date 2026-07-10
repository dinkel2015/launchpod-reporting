import { METRIC_KEYS } from "@/types/metrics";
import type { ReportMetric } from "@/types/metrics";
import type { GeneratedObservation, Rule, RuleInput } from "./types";

type ChartContext = {
  platform?: string;
  category?: string;
  market?: string;
  denominator?: number;
  date?: string;
};

/**
 * Episode/chart-level tagging isn't strictly typed yet, so context (platform, category,
 * market, denominator, date) is read out of freeform notes/sourceReference using a
 * permissive "key: value" / "key=value" parser. Missing fields are simply omitted from
 * the generated sentence rather than fabricated.
 */
function parseChartContext(source: string | null): ChartContext {
  const context: ChartContext = {};
  if (!source) return context;

  for (const part of source.split(/[;,]/)) {
    const separatorIndex = part.search(/[:=]/);
    if (separatorIndex === -1) continue;
    const key = part.slice(0, separatorIndex).trim().toLowerCase();
    const value = part.slice(separatorIndex + 1).trim();
    if (!value) continue;

    if (key === "platform") context.platform = value;
    else if (key === "category") context.category = value;
    else if (key === "market") context.market = value;
    else if (key === "denominator" || key === "total" || key === "chart_size") {
      const num = Number(value);
      if (!Number.isNaN(num)) context.denominator = num;
    } else if (key === "date" || key === "period") context.date = value;
  }
  return context;
}

function mergeContext(metric: ReportMetric): ChartContext {
  const fromSourceReference = parseChartContext(metric.sourceReference);
  const fromNotes = parseChartContext(metric.notes);
  return { ...fromSourceReference, ...fromNotes };
}

function describeContext(context: ChartContext): string {
  const fragments: string[] = [];
  if (context.platform) fragments.push(context.platform);
  if (context.category) fragments.push(`${context.category} category`);
  if (context.market) fragments.push(`${context.market} market`);
  if (context.date) fragments.push(`as of ${context.date}`);
  return fragments.length > 0 ? ` (${fragments.join(", ")})` : "";
}

function isNotCharting(value: ReportMetric["value"]): boolean {
  if (value === null) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "" || normalized === "n/a" || normalized === "none" || normalized.includes("not charting");
  }
  return false;
}

export const chartRankingsRule: Rule = {
  id: "rule_chart_rankings",
  appliesTo: (input: RuleInput) =>
    input.metrics.some(
      (m) =>
        (m.metricKey === METRIC_KEYS.PODSEO_CHART_CURRENT_STATUS || m.metricKey === METRIC_KEYS.PODSEO_CHART_PEAK_RANK) &&
        m.verificationStatus === "verified",
    ),
  generate: (input: RuleInput): GeneratedObservation[] => {
    const current = input.metrics.find(
      (m) => m.metricKey === METRIC_KEYS.PODSEO_CHART_CURRENT_STATUS && m.verificationStatus === "verified",
    );
    const peak = input.metrics.find(
      (m) => m.metricKey === METRIC_KEYS.PODSEO_CHART_PEAK_RANK && m.verificationStatus === "verified",
    );

    const sentences: string[] = [];

    // Current active placement always takes priority over historical best, in present tense.
    if (current) {
      if (isNotCharting(current.value)) {
        sentences.push("Not currently charting.");
      } else {
        const context = describeContext(mergeContext(current));
        sentences.push(`Currently charting at #${current.value}${context}.`);
      }
    }

    // Historical peaks are always phrased in the past tense — never "ranks #X" for a bygone peak.
    if (peak && typeof peak.value === "number") {
      const context = mergeContext(peak);
      const denominatorText = context.denominator ? ` of ${context.denominator}` : "";
      sentences.push(`Historical best: reached #${peak.value}${denominatorText}${describeContext(context)}.`);
    }

    if (sentences.length === 0) return [];

    return [
      {
        reportId: input.reportId,
        sourceType: "podseo",
        metricKey: METRIC_KEYS.PODSEO_CHART_CURRENT_STATUS,
        ruleId: "rule_chart_rankings",
        generatedText: sentences.join(" "),
        displayOrder: 0,
      },
    ];
  },
};
