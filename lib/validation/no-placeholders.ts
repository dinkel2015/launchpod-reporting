import type { ReportSection } from "@/types/report";
import type { ValidationResult } from "./types";

export type NoPlaceholdersInput = {
  sections: ReportSection[];
};

const PLACEHOLDER_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: "template-braces", pattern: /\{\{.*?\}\}/ },
  { name: "TODO", pattern: /\bTODO\b/i },
  { name: "TBD", pattern: /\bTBD\b/i },
  { name: "Lorem ipsum", pattern: /\bLorem ipsum\b/i },
  { name: "[placeholder]", pattern: /\[placeholder\]/i },
  { name: "XXX", pattern: /\bXXX\b/i },
];

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

export function checkNoPlaceholders(input: NoPlaceholdersInput): ValidationResult {
  const checkId = "no-placeholders";
  const label = "No editable placeholder text remains";

  const hits: Array<{ sectionId: string; sectionType: string; pattern: string; snippet: string }> = [];

  for (const section of input.sections) {
    const strings: string[] = [];
    collectStrings(section.contentJson, strings);

    for (const str of strings) {
      for (const { name, pattern } of PLACEHOLDER_PATTERNS) {
        if (pattern.test(str)) {
          hits.push({
            sectionId: section.id,
            sectionType: section.sectionType,
            pattern: name,
            snippet: str.slice(0, 120),
          });
        }
      }
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
    message: `Found ${hits.length} placeholder pattern hit(s) across ${new Set(hits.map((h) => h.sectionId)).size} section(s).`,
    details: { hits },
  };
}
