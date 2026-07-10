import type { Recommendation, RecommendationOwner } from "@/types/report";

export type RecommendationCandidate = {
  text: string;
  owner: RecommendationOwner;
  supportedByData: boolean;
  alreadyExecuting: boolean;
  withinClientControl: boolean;
  redundantWith?: string[];
};

/**
 * id/reportId/included are assigned by the persistence layer, not this pure curation
 * step — mirrors GeneratedObservation's split between "what a rule computes" and "what
 * gets stored."
 */
export type CuratedRecommendation = Omit<Recommendation, "id" | "reportId" | "included">;

const MAX_RECOMMENDATIONS = 4;

export function curateRecommendations(candidates: RecommendationCandidate[]): CuratedRecommendation[] {
  const eligible = candidates.filter(
    (candidate) => candidate.withinClientControl && !candidate.alreadyExecuting && candidate.supportedByData,
  );

  const seenTexts = new Set<string>();
  const deduped: RecommendationCandidate[] = [];
  for (const candidate of eligible) {
    const isRedundant = candidate.redundantWith?.some((text) => seenTexts.has(text)) ?? false;
    if (isRedundant) continue;
    seenTexts.add(candidate.text);
    deduped.push(candidate);
  }

  return deduped.slice(0, MAX_RECOMMENDATIONS).map((candidate, index) => ({
    text: candidate.text,
    owner: candidate.owner,
    displayOrder: index,
  }));
}
