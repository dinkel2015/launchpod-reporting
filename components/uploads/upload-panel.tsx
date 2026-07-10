"use client";

import { useActionState, useState } from "react";
import { uploadSourceFile, removeSourceFile } from "@/app/admin/(protected)/reports/[id]/uploads/actions";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldGroup } from "@/components/ui/field";
import { formatFileSize } from "@/lib/storage";
import { cn } from "@/lib/utils";

type UploadRow = {
  id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  snapshot_date: string | null;
  parsing_status: string;
  validation_status: string;
  storage_path: string;
};

const statusTone: Record<string, "neutral" | "green" | "amber" | "red"> = {
  pending: "neutral",
  processing: "amber",
  parsed: "green",
  manual_only: "neutral",
  failed: "red",
  unverified: "neutral",
  verified: "green",
  conflict: "red",
};

export function UploadPanel({
  reportId,
  sourceType,
  label,
  uploads,
}: {
  reportId: string;
  sourceType: "spotify" | "apple" | "podseo" | "hosting";
  label: string;
  uploads: UploadRow[];
}) {
  const [state, formAction, pending] = useActionState<{ error: string | null }, FormData>(
    uploadSourceFile,
    { error: null },
  );
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);

  async function handleView(storagePath: string) {
    const res = await fetch(`/api/uploads/signed-url?path=${encodeURIComponent(storagePath)}`);
    const data = await res.json();
    if (data.url) setViewingUrl(data.url);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <span className="text-xs text-[#8b95a1]">{uploads.length} file(s)</span>
      </CardHeader>

      <div className="mb-4 space-y-3">
        {uploads.map((upload) => (
          <div key={upload.id} className="rounded-lg border border-border-subtle p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{upload.file_name}</p>
                <p className="text-xs text-[#8b95a1]">
                  {upload.file_type} · {formatFileSize(upload.file_size_bytes)}
                  {upload.snapshot_date && ` · snapshot ${upload.snapshot_date}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Badge tone={statusTone[upload.parsing_status]}>{upload.parsing_status.replace(/_/g, " ")}</Badge>
                <Badge tone={statusTone[upload.validation_status]}>{upload.validation_status}</Badge>
              </div>
            </div>
            <div className="mt-2 flex gap-3 text-xs">
              <button
                type="button"
                onClick={() => handleView(upload.storage_path)}
                className="font-medium text-brand-pink hover:underline"
              >
                View source
              </button>
              <form action={removeSourceFile.bind(null, reportId, upload.id, upload.storage_path)}>
                <button type="submit" className="font-medium text-[#c02929] hover:underline">
                  Remove
                </button>
              </form>
            </div>
          </div>
        ))}
        {uploads.length === 0 && (
          <p className="text-sm text-[#8b95a1]">No files uploaded yet.</p>
        )}
      </div>

      <form action={formAction} className={cn("space-y-3 border-t border-border-subtle pt-4")}>
        <input type="hidden" name="reportId" value={reportId} />
        <input type="hidden" name="sourceType" value={sourceType} />
        <FieldGroup className="mb-0">
          <Label htmlFor={`${sourceType}-file`}>File (CSV, PDF, SVG, PNG, JPG)</Label>
          <Input
            id={`${sourceType}-file`}
            name="file"
            type="file"
            accept=".csv,.pdf,.svg,.png,.jpg,.jpeg"
            required
          />
        </FieldGroup>
        <FieldGroup className="mb-0">
          <Label htmlFor={`${sourceType}-snapshot`}>Snapshot date (if screenshot)</Label>
          <Input id={`${sourceType}-snapshot`} name="snapshotDate" type="date" />
        </FieldGroup>
        {state.error && <p className="text-sm text-[#c02929]">{state.error}</p>}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Uploading…" : "Upload"}
        </Button>
      </form>

      {viewingUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-8" onClick={() => setViewingUrl(null)}>
          <div className="h-full w-full max-w-4xl rounded-lg bg-white p-2" onClick={(e) => e.stopPropagation()}>
            <iframe src={viewingUrl} className="h-full w-full rounded" />
          </div>
        </div>
      )}
    </Card>
  );
}
