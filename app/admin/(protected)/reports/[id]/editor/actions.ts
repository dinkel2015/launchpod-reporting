"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { dbRowToReportMetric } from "@/lib/metrics-mapper";
import { runRuleEngine } from "@/lib/rules/engine";
import {
  generateMonthOverMonthSnapshot,
  generateAudience,
  generateSearchVisibility,
} from "@/lib/report-builder/generate-sections";
import { runValidationGates } from "@/lib/validation/run-all";
import type { ValidationReport } from "@/lib/validation/types";
import type { SectionType } from "@/types/report";

async function loadVerifiedMetrics(reportId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("report_metrics")
    .select("*")
    .eq("report_id", reportId)
    .eq("verification_status", "verified");
  return (data ?? []).map(dbRowToReportMetric);
}

export async function runRuleEngineAction(reportId: string) {
  const supabase = await createClient();
  const { data: report } = await supabase.from("reports").select("*").eq("id", reportId).single();
  if (!report) return;

  const metrics = await loadVerifiedMetrics(reportId);

  let previousReportsMetrics: ReturnType<typeof dbRowToReportMetric>[][] | undefined;
  if (report.previous_report_id) {
    previousReportsMetrics = [await loadVerifiedMetrics(report.previous_report_id)];
  }

  const observations = runRuleEngine({
    reportId,
    metrics,
    humanContext: report.human_context,
    episodesPublishedThisMonth: report.expected_episode_frequency ?? 2,
    expectedEpisodeFrequency: report.expected_episode_frequency,
    previousReportsMetrics,
  });

  await supabase.from("report_observations").delete().eq("report_id", reportId);
  if (observations.length > 0) {
    await supabase.from("report_observations").insert(
      observations.map((obs) => ({
        report_id: obs.reportId,
        source_type: obs.sourceType ?? null,
        metric_key: obs.metricKey ?? null,
        rule_id: obs.ruleId,
        generated_text: obs.generatedText,
        display_order: obs.displayOrder,
      })),
    );
  }

  revalidatePath(`/admin/reports/${reportId}/editor`);
}

const GENERATABLE_SECTIONS: Partial<Record<SectionType, true>> = {
  month_over_month_snapshot: true,
  audience: true,
  search_visibility: true,
};

export async function regenerateSection(reportId: string, sectionId: string, sectionType: SectionType) {
  if (!GENERATABLE_SECTIONS[sectionType]) return;

  const supabase = await createClient();
  const metrics = await loadVerifiedMetrics(reportId);
  const { data: observationRows } = await supabase
    .from("report_observations")
    .select("*")
    .eq("report_id", reportId);
  const observations = (observationRows ?? []).map((o) => ({
    reportId: o.report_id,
    sourceType: o.source_type ?? "",
    metricKey: o.metric_key ?? "",
    ruleId: o.rule_id,
    generatedText: o.generated_text,
    displayOrder: o.display_order,
  }));

  let content: unknown = null;
  if (sectionType === "month_over_month_snapshot") {
    content = generateMonthOverMonthSnapshot(metrics, observations);
  } else if (sectionType === "audience") {
    content = generateAudience(metrics);
  } else if (sectionType === "search_visibility") {
    content = generateSearchVisibility(metrics);
  }

  if (!content) return;

  await supabase.from("report_sections").update({ content_json: content as never }).eq("id", sectionId);
  revalidatePath(`/admin/reports/${reportId}/editor`);
}

export async function updateSectionContent(reportId: string, sectionId: string, contentJsonText: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contentJsonText);
  } catch {
    return { error: "Invalid JSON." };
  }

  const supabase = await createClient();
  await supabase.from("report_sections").update({ content_json: parsed as never }).eq("id", sectionId);
  revalidatePath(`/admin/reports/${reportId}/editor`);
  return { error: null };
}

export async function toggleSectionEnabled(reportId: string, sectionId: string, enabled: boolean) {
  const supabase = await createClient();
  await supabase.from("report_sections").update({ enabled }).eq("id", sectionId);
  revalidatePath(`/admin/reports/${reportId}/editor`);
}

export async function reorderSection(reportId: string, sectionId: string, direction: "up" | "down") {
  const supabase = await createClient();
  const { data: sections } = await supabase
    .from("report_sections")
    .select("id, display_order")
    .eq("report_id", reportId)
    .order("display_order");

  if (!sections) return;
  const index = sections.findIndex((s) => s.id === sectionId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= sections.length) return;

  const a = sections[index];
  const b = sections[swapWith];
  await supabase.from("report_sections").update({ display_order: b.display_order }).eq("id", a.id);
  await supabase.from("report_sections").update({ display_order: a.display_order }).eq("id", b.id);
  revalidatePath(`/admin/reports/${reportId}/editor`);
}

export async function addRecommendation(reportId: string, formData: FormData) {
  const text = String(formData.get("text") ?? "").trim();
  const owner = String(formData.get("owner") ?? "lpm") as "client" | "lpm" | "shared";
  if (!text) return;

  const supabase = await createClient();
  const { count } = await supabase
    .from("recommendations")
    .select("id", { count: "exact", head: true })
    .eq("report_id", reportId);

  await supabase.from("recommendations").insert({
    report_id: reportId,
    text,
    owner,
    display_order: count ?? 0,
  });
  revalidatePath(`/admin/reports/${reportId}/editor`);
}

export async function deleteRecommendation(reportId: string, recommendationId: string) {
  const supabase = await createClient();
  await supabase.from("recommendations").delete().eq("id", recommendationId);
  revalidatePath(`/admin/reports/${reportId}/editor`);
}

export async function toggleRecommendationIncluded(reportId: string, recommendationId: string, included: boolean) {
  const supabase = await createClient();
  await supabase.from("recommendations").update({ included }).eq("id", recommendationId);
  revalidatePath(`/admin/reports/${reportId}/editor`);
}

export async function runValidation(reportId: string): Promise<ValidationReport> {
  const supabase = await createClient();
  const { data: report } = await supabase.from("reports").select("*").eq("id", reportId).single();
  const { data: metricRows } = await supabase.from("report_metrics").select("*").eq("report_id", reportId);
  const { data: sectionRows } = await supabase.from("report_sections").select("*").eq("report_id", reportId);
  const { data: recommendationRows } = await supabase
    .from("recommendations")
    .select("*")
    .eq("report_id", reportId);

  if (!report) {
    return { results: [], canPublish: false };
  }

  const metrics = (metricRows ?? []).map(dbRowToReportMetric);
  const sections = (sectionRows ?? []).map((s) => ({
    id: s.id,
    reportId: s.report_id,
    sectionType: s.section_type as SectionType,
    enabled: s.enabled,
    displayOrder: s.display_order,
    contentJson: (s.content_json ?? {}) as Record<string, unknown>,
    internalNotes: s.internal_notes,
  }));
  const recommendations = (recommendationRows ?? []).map((r) => ({
    id: r.id,
    reportId: r.report_id,
    text: r.text,
    owner: r.owner,
    included: r.included,
    displayOrder: r.display_order,
  }));

  const competitorSection = sections.find((s) => s.sectionType === "competitor_comparison");
  const competitors = (competitorSection?.contentJson as { competitors?: { name: string; visibilityRank: number }[] } | undefined)?.competitors;

  return runValidationGates({
    report: {
      id: report.id,
      clientId: report.client_id,
      title: report.title,
      reportingPeriodStart: report.reporting_period_start,
      reportingPeriodEnd: report.reporting_period_end,
      reportMonth: report.report_month,
      expectedEpisodeFrequency: report.expected_episode_frequency,
      previousReportId: report.previous_report_id,
      status: report.status,
      humanContext: report.human_context,
      reportContentJson: report.report_content_json as Record<string, unknown> | null,
      publishedAt: report.published_at,
      createdBy: report.created_by,
      createdAt: report.created_at,
      updatedAt: report.updated_at,
    },
    metrics,
    sections,
    recommendations,
    competitors,
  });
}

export async function publishReport(reportId: string) {
  const validation = await runValidation(reportId);
  if (!validation.canPublish) {
    return { error: "Validation failed — resolve blocking issues before publishing." };
  }

  const supabase = await createClient();
  await supabase
    .from("reports")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", reportId);

  revalidatePath(`/admin/reports/${reportId}`);
  revalidatePath(`/admin/reports/${reportId}/editor`);
  return { error: null };
}
