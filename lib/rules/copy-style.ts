/**
 * Shared text-composition helpers enforcing house editorial style across all rule files.
 */

export const BANNED_PHRASES = [
  "worth noting that",
  "it is important to mention",
  "interestingly",
  "it is important to note",
  "this is a testament to",
] as const;

/** Prefer these over causal/absolute language when describing a pattern in the data. */
export const HEDGE_PHRASES = [
  "this is consistent with",
  "this may reflect",
  "the available data suggests",
  "this pattern is worth tracking",
] as const;

const OVERSTATEMENT_PATTERNS: RegExp[] = [/this proves/i, /this clearly caused/i, /this guarantees/i];

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function findBannedPhrases(text: string): string[] {
  const lower = text.toLowerCase();
  return BANNED_PHRASES.filter((phrase) => lower.includes(phrase));
}

export function stripBannedPhrases(text: string): string {
  let result = text;
  for (const phrase of BANNED_PHRASES) {
    const pattern = new RegExp(escapeForRegExp(phrase), "gi");
    result = result.replace(pattern, "");
  }
  return result.replace(/\s{2,}/g, " ").trim();
}

/**
 * Dev-time guard, not a validator for end users: throws so causation overstatements
 * are caught while authoring copy templates, rather than shipped to a client report.
 */
export function assertNoCausationOverstatement(text: string): void {
  for (const pattern of OVERSTATEMENT_PATTERNS) {
    if (pattern.test(text)) {
      throw new Error(
        `Causation overstatement detected in generated text: "${text}". Prefer hedge phrasing such as: ${HEDGE_PHRASES.join(", ")}.`,
      );
    }
  }
}
