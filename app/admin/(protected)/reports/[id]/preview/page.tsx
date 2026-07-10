import { createClient } from "@/lib/supabase/server";
import { ReportView } from "@/components/report/report-view";
import { composeRenderSections } from "@/lib/report-builder/compose-render-sections";

export default async function ReportPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: sections } = await supabase
    .from("report_sections")
    .select("id, section_type, enabled, display_order, content_json")
    .eq("report_id", id)
    .order("display_order");
  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("text, owner, included")
    .eq("report_id", id);

  const renderSections = composeRenderSections(sections ?? [], recommendations ?? []);

  return (
    <div>
      <p className="no-print mb-4 rounded-md bg-brand-pink-tint px-4 py-2 text-sm text-brand-pink">
        This is what the client will see — draft/internal content is never shown here.
      </p>
      <ReportView sections={renderSections} footerNote="LaunchPod Media · launchpod.media" />
    </div>
  );
}
