import type { RenderableSection } from "@/components/report/report-view";

type SectionRow = {
  id: string;
  section_type: string;
  enabled: boolean;
  display_order: number;
  content_json: unknown;
};

type RecommendationRow = {
  text: string;
  owner: "client" | "lpm" | "shared";
  included: boolean;
};

/** recommendations live in their own table, not in a section's content_json — this is the one place they're merged in for rendering. */
export function composeRenderSections(
  sections: SectionRow[],
  recommendations: RecommendationRow[],
): RenderableSection[] {
  return sections.map((section) => {
    if (section.section_type === "recommendations") {
      return {
        id: section.id,
        sectionType: section.section_type,
        enabled: section.enabled,
        displayOrder: section.display_order,
        contentJson: {
          items: recommendations.filter((r) => r.included).map((r) => ({ text: r.text, owner: r.owner })),
        },
      };
    }

    return {
      id: section.id,
      sectionType: section.section_type,
      enabled: section.enabled,
      displayOrder: section.display_order,
      contentJson: (section.content_json ?? {}) as Record<string, unknown>,
    };
  });
}
