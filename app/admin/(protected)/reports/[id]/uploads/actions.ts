"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildStoragePath } from "@/lib/storage";
import type { Database } from "@/types/database";

type UploadSourceType = Database["public"]["Tables"]["report_uploads"]["Row"]["source_type"];

export async function uploadSourceFile(
  _prevState: { error: string | null },
  formData: FormData,
) {
  const reportId = String(formData.get("reportId") ?? "");
  const sourceType = String(formData.get("sourceType") ?? "") as UploadSourceType;
  const file = formData.get("file") as File | null;
  const snapshotDate = String(formData.get("snapshotDate") ?? "") || null;
  if (!file || file.size === 0) {
    return { error: "Choose a file to upload." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const storagePath = buildStoragePath(reportId, sourceType, file.name);
  const { error: storageError } = await supabase.storage
    .from("report-uploads")
    .upload(storagePath, file, { contentType: file.type });

  if (storageError) {
    return { error: storageError.message };
  }

  const isCsv = file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");

  const { error: dbError } = await supabase.from("report_uploads").insert({
    report_id: reportId,
    source_type: sourceType,
    file_name: file.name,
    file_type: file.type || "application/octet-stream",
    file_size_bytes: file.size,
    storage_path: storagePath,
    snapshot_date: snapshotDate,
    parsing_status: isCsv ? "pending" : "manual_only",
    validation_status: "unverified",
    uploaded_by: user?.id ?? null,
  });

  if (dbError) {
    return { error: dbError.message };
  }

  revalidatePath(`/admin/reports/${reportId}/uploads`);
  return { error: null };
}

export async function removeSourceFile(reportId: string, uploadId: string, storagePath: string) {
  const supabase = await createClient();
  await supabase.storage.from("report-uploads").remove([storagePath]);
  await supabase.from("report_uploads").delete().eq("id", uploadId);
  revalidatePath(`/admin/reports/${reportId}/uploads`);
}

export async function getSourceFileUrl(storagePath: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("report-uploads")
    .createSignedUrl(storagePath, 60 * 10);

  if (error) return null;
  return data.signedUrl;
}
