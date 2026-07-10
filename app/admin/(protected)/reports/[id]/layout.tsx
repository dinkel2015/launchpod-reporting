import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

const statusTone: Record<string, "neutral" | "green" | "amber" | "pink"> = {
  draft: "neutral",
  processing: "amber",
  needs_review: "amber",
  ready_to_publish: "pink",
  published: "green",
  archived: "neutral",
};

export default async function ReportLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: report } = await supabase
    .from("reports")
    .select("id, title, status, clients ( name )")
    .eq("id", id)
    .single();

  if (!report) notFound();
  const clientName = (report.clients as unknown as { name: string } | null)?.name;

  const tabs = [
    { href: `/admin/reports/${id}`, label: "Overview" },
    { href: `/admin/reports/${id}/uploads`, label: "Uploads" },
    { href: `/admin/reports/${id}/metrics`, label: "Metrics" },
    { href: `/admin/reports/${id}/editor`, label: "Editor" },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-[#8b95a1]">{clientName}</p>
          <h1 className="text-xl font-bold tracking-tight">{report.title}</h1>
        </div>
        <Badge tone={statusTone[report.status] ?? "neutral"}>{report.status.replace(/_/g, " ")}</Badge>
      </div>
      <nav className="mb-6 flex gap-1 border-b border-border-subtle">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-3 py-2 text-sm font-medium text-[#6b7580] hover:text-brand-pink"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
