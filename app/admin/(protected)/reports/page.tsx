import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusTone: Record<string, "neutral" | "green" | "amber" | "pink"> = {
  draft: "neutral",
  processing: "amber",
  needs_review: "amber",
  ready_to_publish: "pink",
  published: "green",
  archived: "neutral",
};

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("id, title, report_month, status, updated_at, clients ( name )")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <Link href="/admin/reports/new">
          <Button>New report</Button>
        </Link>
      </div>

      {!reports || reports.length === 0 ? (
        <Card className="text-center text-sm text-[#6b7580]">No reports yet.</Card>
      ) : (
        <div className="grid gap-3">
          {reports.map((report) => (
            <Link key={report.id} href={`/admin/reports/${report.id}`}>
              <Card className="flex items-center justify-between transition-shadow hover:shadow-md">
                <div>
                  <div className="font-semibold">{report.title}</div>
                  <div className="text-sm text-[#6b7580]">
                    {(report.clients as unknown as { name: string } | null)?.name} · {report.report_month}
                  </div>
                </div>
                <Badge tone={statusTone[report.status] ?? "neutral"}>
                  {report.status.replace(/_/g, " ")}
                </Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
