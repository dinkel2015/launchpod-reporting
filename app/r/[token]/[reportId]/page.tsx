import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/service";
import { ReportView } from "@/components/report/report-view";
import { composeRenderSections } from "@/lib/report-builder/compose-render-sections";
import { ExportBar } from "@/components/export/export-bar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ClientReportPage({
  params,
}: {
  params: Promise<{ token: string; reportId: string }>;
}) {
  const { token, reportId } = await params;
  const supabase = createServiceClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, active")
    .eq("private_access_token", token)
    .single();

  if (!client || !client.active) notFound();

  const { data: report } = await supabase
    .from("reports")
    .select("id, title, report_month, status, client_id")
    .eq("id", reportId)
    .single();

  if (!report || report.client_id !== client.id || report.status !== "published") notFound();

  const { data: sections } = await supabase
    .from("report_sections")
    .select("id, section_type, enabled, display_order, content_json")
    .eq("report_id", reportId)
    .order("display_order");
  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("text, owner, included")
    .eq("report_id", reportId);

  const renderSections = composeRenderSections(sections ?? [], recommendations ?? []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <ExportBar fileBaseName={`${client.name}-${report.report_month}`} />
      <ReportView sections={renderSections} footerNote="LaunchPod Media · launchpod.media" />
    </div>
  );
}
