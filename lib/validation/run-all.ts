import type { Report } from "@/types/report";
import type { ReportMetric } from "@/types/metrics";
import type { ReportSection, Recommendation } from "@/types/report";
import { checkDownloadsReconcile } from "./downloads-reconcile";
import { checkMetricsVerified } from "./metrics-verified";
import { checkSourceReferences } from "./source-references";
import { checkDemographicsSourcing, checkDemographicsPercentageSums } from "./demographics";
import { checkRankDirection } from "./rank-direction";
import { checkSnapshotDates } from "./snapshot-dates";
import { checkChartTense } from "./chart-tense";
import { checkChartCurrentVsHistorical } from "./chart-current-vs-historical";
import { checkCompetitorOrder, type Competitor } from "./competitor-order";
import { checkMetricConflicts } from "./metric-conflicts";
import { checkNoPlaceholders } from "./no-placeholders";
import { checkUnsupportedClaims } from "./unsupported-claims";
import { checkHtmlStructure } from "./html-structure";
import { checkNoGradientText, type GradientTextSource } from "./no-gradient-text";
import type { ValidationResult, ValidationReport } from "./types";

export type RunValidationGatesInput = {
  report: Report;
  metrics: ReportMetric[];
  sections: ReportSection[];
  recommendations: Recommendation[];

  // Optional: the gate can run in "metrics only" mode (e.g. right after
  // upload parsing, before sections/HTML exist) by omitting everything below.
  // Structural checks whose input is absent report as passed/skipped rather
  // than blocking, since there's nothing to validate yet.
  html?: string;
  additionalGradientTextSources?: GradientTextSource[];
  competitors?: Competitor[];
  confirmedSameDayCaptureMetricIds?: Set<string>;
};

function skipped(checkId: string, label: string, severity: ValidationResult["severity"]): ValidationResult {
  return { checkId, label, passed: true, severity, message: "skipped — no input provided" };
}

function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === "string") {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const v of Object.values(value)) collectStrings(v, out);
  }
}

export function runValidationGates(input: RunValidationGatesInput): ValidationReport {
  const results: ValidationResult[] = [];

  // Always run when metrics are provided — these are the core financial/factual
  // integrity checks and must never be silently skipped.
  results.push(checkDownloadsReconcile({ metrics: input.metrics }));
  results.push(checkMetricsVerified({ metrics: input.metrics }));
  results.push(checkSourceReferences({ metrics: input.metrics }));
  results.push(checkMetricConflicts({ metrics: input.metrics }));

  results.push(checkDemographicsSourcing({ metrics: input.metrics }));
  results.push(checkDemographicsPercentageSums({ metrics: input.metrics }));
  results.push(checkRankDirection({ metrics: input.metrics }));
  results.push(
    checkSnapshotDates({
      metrics: input.metrics,
      reportingPeriodEnd: input.report.reportingPeriodEnd,
      confirmedSameDayCapture: input.confirmedSameDayCaptureMetricIds,
    })
  );

  results.push(checkNoPlaceholders({ sections: input.sections }));
  results.push(checkUnsupportedClaims({ sections: input.sections }));

  const chartRankingsSection = input.sections.find((s) => s.sectionType === "chart_rankings");
  if (chartRankingsSection) {
    const chartStrings: string[] = [];
    collectStrings(chartRankingsSection.contentJson, chartStrings);
    results.push(checkChartTense({ chartRankingsText: chartStrings.join(" \n ") }));
    results.push(
      checkChartCurrentVsHistorical({ chartRankingsContentJson: chartRankingsSection.contentJson })
    );
  } else {
    results.push(skipped("chart-tense", "Chart ranking claims are tense-qualified", "warning"));
    results.push(
      skipped(
        "chart-current-vs-historical",
        "Current chart placement is structurally separated from historical peak",
        "blocking"
      )
    );
  }

  if (input.competitors) {
    results.push(checkCompetitorOrder({ competitors: input.competitors }));
  } else {
    results.push(
      skipped("competitor-order", "Competitors are ordered by visibility rank, best to worst", "blocking")
    );
  }

  if (input.html) {
    results.push(checkHtmlStructure({ html: input.html }));
  } else {
    results.push(skipped("html-structure", "Rendered HTML is structurally sound", "blocking"));
  }

  const gradientSources: GradientTextSource[] = [
    ...(input.html ? [{ label: "rendered-report", content: input.html }] : []),
    ...(input.additionalGradientTextSources ?? []),
  ];
  if (gradientSources.length > 0) {
    results.push(checkNoGradientText({ sources: gradientSources }));
  } else {
    results.push(skipped("no-gradient-text", "No gradient-clipped text", "blocking"));
  }

  const canPublish = results.every((r) => r.severity !== "blocking" || r.passed);

  return { results, canPublish };
}
