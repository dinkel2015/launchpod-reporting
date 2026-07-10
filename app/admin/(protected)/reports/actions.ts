"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SECTION_ORDER } from "@/types/report";
import type { Database } from "@/types/database";

type ReportStatus = Database["public"]["Tables"]["reports"]["Row"]["status"];

export async function createReport(_prevState: { error: string | null }, formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "");
  const podcastName = String(formData.get("podcastName") ?? "").trim();
  const periodStart = String(formData.get("periodStart") ?? "");
  const periodEnd = String(formData.get("periodEnd") ?? "");
  const reportMonth = String(formData.get("reportMonth") ?? "").trim();
  const previousReportId = String(formData.get("previousReportId") ?? "") || null;
  const expectedFrequencyRaw = String(formData.get("expectedEpisodeFrequency") ?? "");

  if (!clientId || !periodStart || !periodEnd || !reportMonth) {
    return { error: "Client, reporting period, and report month are required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      client_id: clientId,
      title: `${podcastName || "Monthly Report"} — ${reportMonth}`,
      reporting_period_start: periodStart,
      reporting_period_end: periodEnd,
      report_month: reportMonth,
      previous_report_id: previousReportId,
      expected_episode_frequency: expectedFrequencyRaw ? Number(expectedFrequencyRaw) : null,
      status: "draft",
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !report) {
    return { error: error?.message ?? "Could not create report." };
  }

  const sectionRows = DEFAULT_SECTION_ORDER.map((sectionType, index) => ({
    report_id: report.id,
    section_type: sectionType,
    enabled: true,
    display_order: index,
    content_json: {},
  }));
  await supabase.from("report_sections").insert(sectionRows);

  revalidatePath("/admin/reports");
  redirect(`/admin/reports/${report.id}`);
}

export async function updateReportContext(reportId: string, formData: FormData) {
  const humanContext = String(formData.get("humanContext") ?? "");
  const supabase = await createClient();
  await supabase.from("reports").update({ human_context: humanContext }).eq("id", reportId);
  revalidatePath(`/admin/reports/${reportId}`);
}

export async function setReportStatus(reportId: string, status: ReportStatus) {
  const supabase = await createClient();
  await supabase.from("reports").update({ status }).eq("id", reportId);
  revalidatePath(`/admin/reports/${reportId}`);
}
