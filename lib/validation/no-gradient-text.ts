import type { ValidationResult } from "./types";

export type GradientTextSource = {
  label: string;
  content: string;
};

export type NoGradientTextInput = {
  // Scan both the admin UI's rendered/styled output and the exported report's
  // HTML/CSS — gradient text is a brand violation wherever it appears.
  sources: GradientTextSource[];
};

const BACKGROUND_CLIP_TEXT_PATTERN = /(-webkit-)?background-clip:\s*text/gi;
const GRADIENT_FUNCTION_PATTERN = /(linear|radial)-gradient\s*\(/gi;
const TRANSPARENT_COLOR_PATTERN = /color:\s*transparent\b/gi;
const NEARBY_WINDOW = 200;

export function checkNoGradientText(input: NoGradientTextInput): ValidationResult {
  const checkId = "no-gradient-text";
  const label = "No gradient-clipped text";

  const hits: Array<{ source: string; reason: string; snippet: string }> = [];

  for (const { label: sourceLabel, content } of input.sources) {
    for (const match of content.matchAll(BACKGROUND_CLIP_TEXT_PATTERN)) {
      hits.push({
        source: sourceLabel,
        reason: "background-clip: text",
        snippet: content.slice(Math.max(0, (match.index ?? 0) - 20), (match.index ?? 0) + 40),
      });
    }

    for (const gradientMatch of content.matchAll(GRADIENT_FUNCTION_PATTERN)) {
      const gIndex = gradientMatch.index ?? 0;
      const windowStart = Math.max(0, gIndex - NEARBY_WINDOW);
      const windowEnd = Math.min(content.length, gIndex + NEARBY_WINDOW);
      const window = content.slice(windowStart, windowEnd);
      if (TRANSPARENT_COLOR_PATTERN.test(window)) {
        hits.push({
          source: sourceLabel,
          reason: "gradient function near color: transparent",
          snippet: window,
        });
      }
      TRANSPARENT_COLOR_PATTERN.lastIndex = 0;
    }
  }

  if (hits.length === 0) {
    return { checkId, label, passed: true, severity: "blocking", message: "" };
  }

  return {
    checkId,
    label,
    passed: false,
    severity: "blocking",
    message: `Found ${hits.length} gradient-text pattern hit(s) across ${new Set(hits.map((h) => h.source)).size} source(s).`,
    details: { hits },
  };
}
