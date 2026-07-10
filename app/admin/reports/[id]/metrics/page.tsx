import { createClient } from "@/lib/supabase/server";
import { AddMetricForm } from "@/components/metrics/add-metric-form";
import { MetricRow } from "@/components/metrics/metric-row";

const SOURCE_LABELS: Record<string, string> = {
  apple: "Apple",
  spotify: "Spotify",
  podseo: "PodSEO",
  hosting: "Hosting",
};

export default async function MetricsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: metrics } = await supabase
    .from("report_metrics")
    .select("*")
    .eq("report_id", id)
    .order("source_type")
    .order("metric_key");

  const grouped = (metrics ?? []).reduce<Record<string, typeof metrics>>((acc, metric) => {
    (acc[metric.source_type] ??= []).push(metric);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <AddMetricForm reportId={id} />

      {Object.entries(grouped).map(([sourceType, sourceMetrics]) => (
        <div key={sourceType}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#6b7580]">
            {SOURCE_LABELS[sourceType] ?? sourceType}
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs font-semibold uppercase text-[#8b95a1]">
                <th className="pb-2">Metric</th>
                <th className="pb-2">Value</th>
                <th className="pb-2">Authority</th>
                <th className="pb-2">Source</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Included</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sourceMetrics!.map((metric) => (
                <MetricRow key={metric.id} reportId={id} metric={metric} />
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {(!metrics || metrics.length === 0) && (
        <p className="text-sm text-[#6b7580]">
          No metrics yet. Upload source evidence, then enter each figure here tied to its source.
        </p>
      )}
    </div>
  );
}
