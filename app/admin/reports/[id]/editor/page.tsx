import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SectionEditorCard } from "@/components/editor/section-editor-card";
import { RecommendationsPanel } from "@/components/editor/recommendations-panel";
import { ValidationPanel } from "@/components/editor/validation-panel";
import { Button } from "@/components/ui/button";
import { RunRuleEngineButton } from "./run-rule-engine-button";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: report } = await supabase.from("reports").select("status").eq("id", id).single();
  const { data: sections } = await supabase
    .from("report_sections")
    .select("id, section_type, enabled, display_order, content_json")
    .eq("report_id", id)
    .order("display_order");
  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("id, text, owner, included")
    .eq("report_id", id)
    .order("display_order");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <RunRuleEngineButton reportId={id} />
          <Link href={`/admin/reports/${id}/preview`}>
            <Button size="sm" variant="secondary">
              Client preview
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {(sections ?? []).map((section) => (
            <SectionEditorCard
              key={section.id}
              reportId={id}
              section={{ ...section, content_json: (section.content_json ?? {}) as Record<string, unknown> }}
            />
          ))}
        </div>
        <div className="space-y-4">
          <ValidationPanel reportId={id} alreadyPublished={report?.status === "published"} />
          <RecommendationsPanel reportId={id} recommendations={recommendations ?? []} />
        </div>
      </div>
    </div>
  );
}
