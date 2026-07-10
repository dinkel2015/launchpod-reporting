import type { ValidationResult } from "./types";

export type Competitor = {
  name: string;
  visibilityRank: number;
};

export type CompetitorOrderInput = {
  competitors: Competitor[];
};

export function checkCompetitorOrder(input: CompetitorOrderInput): ValidationResult {
  const checkId = "competitor-order";
  const label = "Competitors are ordered by visibility rank, best to worst";

  const correctOrder = [...input.competitors].sort((a, b) => a.visibilityRank - b.visibilityRank);
  const isSorted = input.competitors.every(
    (c, i) => c.visibilityRank === correctOrder[i]?.visibilityRank && c.name === correctOrder[i]?.name
  );

  if (isSorted) {
    return { checkId, label, passed: true, severity: "blocking", message: "" };
  }

  return {
    checkId,
    label,
    passed: false,
    severity: "blocking",
    message:
      "Competitors must be listed in ascending visibility-rank order (best to worst), not alphabetical or upload order.",
    details: { currentOrder: input.competitors, correctOrder },
  };
}
