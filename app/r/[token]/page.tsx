import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/service";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ClientReportHistoryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, podcast_name, logo_url, active")
    .eq("private_access_token", token)
    .single();

  if (!client || !client.active) notFound();

  const { data: reports } = await supabase
    .from("reports")
    .select("id, title, report_month, published_at")
    .eq("client_id", client.id)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#8b95a1]">LaunchPod Media</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">{client.name}</h1>
      <p className="mb-8 text-sm text-[#6b7580]">{client.podcast_name}</p>

      {!reports || reports.length === 0 ? (
        <p className="text-sm text-[#6b7580]">No published reports yet.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={`/r/${token}/${report.id}`}
              className="block rounded-xl border border-border-subtle bg-surface p-5 transition-shadow hover:shadow-md"
            >
              <p className="font-semibold text-brand-pink">{report.title}</p>
              <p className="text-sm text-[#6b7580]">{report.report_month}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
