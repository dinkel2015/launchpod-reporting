export const ACCEPTED_UPLOAD_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/pdf",
  "image/svg+xml",
  "image/png",
  "image/jpeg",
] as const;

export const ACCEPTED_UPLOAD_EXTENSIONS = [".csv", ".pdf", ".svg", ".png", ".jpg", ".jpeg"];

export function buildStoragePath(reportId: string, sourceType: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${reportId}/${sourceType}/${Date.now()}-${safeName}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
