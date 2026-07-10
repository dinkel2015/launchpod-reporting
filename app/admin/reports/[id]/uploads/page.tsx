import { createClient } from "@/lib/supabase/server";
import { UploadPanel } from "@/components/uploads/upload-panel";

const SOURCES = [
  { type: "spotify" as const, label: "Spotify" },
  { type: "apple" as const, label: "Apple" },
  { type: "podseo" as const, label: "PodSEO" },
  { type: "hosting" as const, label: "Hosting" },
];

export default async function UploadsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: uploads } = await supabase
    .from("report_uploads")
    .select("id, source_type, file_name, file_type, file_size_bytes, snapshot_date, parsing_status, validation_status, storage_path")
    .eq("report_id", id)
    .order("uploaded_at", { ascending: false });

  return (
    <div>
      <p className="mb-4 text-sm text-[#6b7580]">
        Upload evidence for each platform. A report can be saved as a draft even if one or more sources are
        missing.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {SOURCES.map((source) => (
          <UploadPanel
            key={source.type}
            reportId={id}
            sourceType={source.type}
            label={source.label}
            uploads={(uploads ?? []).filter((u) => u.source_type === source.type)}
          />
        ))}
      </div>
    </div>
  );
}
