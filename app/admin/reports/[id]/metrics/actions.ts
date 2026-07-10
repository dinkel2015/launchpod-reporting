"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type MetricRow = Database["public"]["Tables"]["report_metrics"]["Row"];

export async function addMetric(_prevState: { error: string | null }, formData: FormData) {
  const reportId = String(formData.get("reportId") ?? "");
  const sourceType = String(formData.get("sourceType") ?? "") as MetricRow["source_type"];
  const originalLabel = String(formData.get("originalLabel") ?? "").trim();
  const metricKey = String(formData.get("metricKey") ?? "").trim();
  const displayLabel = String(formData.get("displayLabel") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();
  const unit = String(formData.get("unit") ?? "count") as MetricRow["unit"];
  const authorityLevel = String(formData.get("authorityLevel") ?? "manual_verified") as MetricRow["authority_level"];
  const sourceReference = String(formData.get("sourceReference") ?? "").trim();
  const sourcePageRaw = String(formData.get("sourcePage") ?? "");
  const snapshotDate = String(formData.get("snapshotDate") ?? "") || null;
  const notes = String(formData.get("notes") ?? "").trim();

  if (!originalLabel || !metricKey || !displayLabel || !value || !sourceReference) {
    return { error: "Label, metric key, display label, value, and source reference are required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("report_metrics").insert({
    report_id: reportId,
    source_type: sourceType,
    original_label: originalLabel,
    metric_key: metricKey,
    display_label: displayLabel,
    value,
    unit,
    authority_level: authorityLevel,
    verification_status: "unverified",
    source_reference: sourceReference,
    source_page: sourcePageRaw ? Number(sourcePageRaw) : null,
    snapshot_date: snapshotDate,
    notes: notes || null,
    entered_by: user?.id ?? null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/reports/${reportId}/metrics`);
  return { error: null };
}

export async function setVerificationStatus(
  reportId: string,
  metricId: string,
  status: MetricRow["verification_status"],
) {
  const supabase = await createClient();
  await supabase.from("report_metrics").update({ verification_status: status }).eq("id", metricId);
  revalidatePath(`/admin/reports/${reportId}/metrics`);
}

export async function setIncludedInReport(reportId: string, metricId: string, included: boolean) {
  const supabase = await createClient();
  await supabase.from("report_metrics").update({ included_in_report: included }).eq("id", metricId);
  revalidatePath(`/admin/reports/${reportId}/metrics`);
}

export async function deleteMetric(reportId: string, metricId: string) {
  const supabase = await createClient();
  await supabase.from("report_metrics").delete().eq("id", metricId);
  revalidatePath(`/admin/reports/${reportId}/metrics`);
}
