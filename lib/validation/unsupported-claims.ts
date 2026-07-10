import { findBannedPhrases } from "@/lib/rules/copy-style";
import type { ReportSection } from "@/types/report";
import type { ValidationResult } from "./types";

export type UnsupportedClaimsInput = {
  sections: ReportSection[];
};

const STRONG_CAUSATION_PATTERNS = [
  /\bthis proves\b/i,
  /\bthis clearly caused\b/i,
  /\bthis guarantees\b/i,
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

export function checkUnsupportedClaims(input: UnsupportedClaimsInput): ValidationResult {
  const checkId = "unsupported-claims";
  const label = "No banned phrases or unsupported causation language";

  const bannedHits: Array<{ sectionId: string; sectionType: string; phrases: string[] }> = [];
  const causationHits: Array<{ sectionId: string; sectionType: string; snippet: string }> = [];

  for (const section of input.sections) {
    const strings: string[] = [];
    collectStrings(section.contentJson, strings);
    const sectionText = strings.join(" \n ");

    const phrases = findBannedPhrases(sectionText);
    if (phrases.length > 0) {
      bannedHits.push({ sectionId: section.id, sectionType: section.sectionType, phrases });
    }

    for (const pattern of STRONG_CAUSATION_PATTERNS) {
      const match = sectionText.match(pattern);
      if (match) {
        causationHits.push({
          sectionId: section.id,
          sectionType: section.sectionType,
          snippet: match[0],
        });
      }
    }
  }

  if (bannedHits.length === 0 && causationHits.length === 0) {
    return { checkId, label, passed: true, severity: "blocking", message: "" };
  }

  const parts: string[] = [];
  if (bannedHits.length > 0) {
    parts.push(`${bannedHits.length} section(s) contain banned phrases.`);
  }
  if (causationHits.length > 0) {
    parts.push(`${causationHits.length} section(s) contain unsupported strong-causation language.`);
  }

  return {
    checkId,
    label,
    passed: false,
    severity: "blocking",
    message: parts.join(" "),
    details: { bannedHits, causationHits },
  };
}
