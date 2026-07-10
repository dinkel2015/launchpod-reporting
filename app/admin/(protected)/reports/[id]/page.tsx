import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea, Label, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { updateReportContext } from "../actions";

export default async function ReportOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: report } = await supabase.from("reports").select("*").eq("id", id).single();
  if (!report) notFound();

  const { count: uploadCount } = await supabase
    .from("report_uploads")
    .select("id", { count: "exact", head: true })
    .eq("report_id", id);

  const { count: metricCount } = await supabase
    .from("report_metrics")
    .select("id", { count: "exact", head: true })
    .eq("report_id", id);

  const { count: verifiedCount } = await supabase
    .from("report_metrics")
    .select("id", { count: "exact", head: true })
    .eq("report_id", id)
    .eq("verification_status", "verified");

  const updateContext = updateReportContext.bind(null, id);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="space-y-4 md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Human context</CardTitle>
          </CardHeader>
          <p className="mb-3 text-sm text-[#6b7580]">
            Notes from the account manager — guest names, promo activity, anything that explains the numbers.
            This feeds the report copy but never overwrites a verified metric.
          </p>
          <form action={updateContext}>
            <FieldGroup>
              <Label htmlFor="humanContext">Context notes</Label>
              <Textarea
                id="humanContext"
                name="humanContext"
                rows={6}
                defaultValue={report.human_context ?? ""}
              />
            </FieldGroup>
            <Button type="submit" size="sm">
              Save notes
            </Button>
          </form>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Reporting period</CardTitle>
          </CardHeader>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#6b7580]">Period</dt>
              <dd>
                {report.reporting_period_start} → {report.reporting_period_end}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6b7580]">Expected episodes</dt>
              <dd>{report.expected_episode_frequency ?? "—"}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#6b7580]">Source files uploaded</dt>
              <dd>{uploadCount ?? 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6b7580]">Metrics entered</dt>
              <dd>{metricCount ?? 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6b7580]">Metrics verified</dt>
              <dd>
                {verifiedCount ?? 0} / {metricCount ?? 0}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
