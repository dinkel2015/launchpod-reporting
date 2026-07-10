import type { ValidationResult } from "./types";

export type ChartTenseInput = {
  chartRankingsText: string;
};

// Regex-based tense detection is a heuristic, not a grammar parser: it will miss
// unusual phrasing and can false-positive on legitimate present-tense sentences
// that already carry past-tense qualifiers outside our scan window. Treat every
// hit as a prompt for human review, not as ground truth — hence "warning", not
// "blocking".
const PRESENT_TENSE_RANK_PATTERN = /\b(ranks|is)\s*#\s*\d+/gi;
const PAST_TENSE_QUALIFIERS = [
  "reached",
  "peaked",
  "earlier",
  "previously",
  "was",
  "historically",
  "at its peak",
  "prior",
];
const NEARBY_WINDOW = 60;

export function checkChartTense(input: ChartTenseInput): ValidationResult {
  const checkId = "chart-tense";
  const label = "Chart ranking claims are tense-qualified";
  const text = input.chartRankingsText;

  const unqualifiedMatches: string[] = [];
  for (const match of text.matchAll(PRESENT_TENSE_RANK_PATTERN)) {
    const start = Math.max(0, (match.index ?? 0) - NEARBY_WINDOW);
    const end = Math.min(text.length, (match.index ?? 0) + match[0].length + NEARBY_WINDOW);
    const window = text.slice(start, end).toLowerCase();
    const hasQualifier = PAST_TENSE_QUALIFIERS.some((q) => window.includes(q));
    if (!hasQualifier) {
      unqualifiedMatches.push(match[0]);
    }
  }

  if (unqualifiedMatches.length === 0) {
    return { checkId, label, passed: true, severity: "warning", message: "" };
  }

  return {
    checkId,
    label,
    passed: false,
    severity: "warning",
    message: `Found ${unqualifiedMatches.length} present-tense ranking claim(s) without nearby past-tense qualifying language — verify these are current, not historical, placements: ${unqualifiedMatches.join(", ")}.`,
    details: { unqualifiedMatches },
  };
}
