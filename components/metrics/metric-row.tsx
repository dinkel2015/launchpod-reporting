"use client";

import { setVerificationStatus, setIncludedInReport, deleteMetric } from "@/app/admin/reports/[id]/metrics/actions";
import { Badge } from "@/components/ui/badge";

type Metric = {
  id: string;
  original_label: string;
  metric_key: string;
  display_label: string;
  value: string | null;
  unit: string;
  authority_level: string;
  verification_status: string;
  source_reference: string | null;
  source_page: number | null;
  snapshot_date: string | null;
  included_in_report: boolean;
};

const verificationTone: Record<string, "neutral" | "green" | "red" | "amber"> = {
  unverified: "neutral",
  verified: "green",
  conflict: "red",
  excluded: "amber",
};

export function MetricRow({ reportId, metric }: { reportId: string; metric: Metric }) {
  return (
    <tr className="border-b border-border-subtle text-sm">
      <td className="py-2 pr-3">
        <div className="font-medium">{metric.display_label}</div>
        <div className="text-xs text-[#8b95a1]">
          {metric.metric_key} · orig: “{metric.original_label}”
        </div>
      </td>
      <td className="py-2 pr-3 font-semibold">
        {metric.value} <span className="font-normal text-[#8b95a1]">{metric.unit}</span>
      </td>
      <td className="py-2 pr-3 text-xs text-[#6b7580]">{metric.authority_level.replace(/_/g, " ")}</td>
      <td className="py-2 pr-3 text-xs text-[#6b7580]">
        {metric.source_reference}
        {metric.source_page ? ` p.${metric.source_page}` : ""}
        {metric.snapshot_date ? ` · ${metric.snapshot_date}` : ""}
      </td>
      <td className="py-2 pr-3">
        <Badge tone={verificationTone[metric.verification_status]}>{metric.verification_status}</Badge>
      </td>
      <td className="py-2 pr-3">
        <label className="flex items-center gap-1.5 text-xs">
          <input
            type="checkbox"
            defaultChecked={metric.included_in_report}
            onChange={(e) => setIncludedInReport(reportId, metric.id, e.target.checked)}
          />
          In report
        </label>
      </td>
      <td className="py-2 text-right">
        <div className="flex justify-end gap-2 text-xs">
          {metric.verification_status !== "verified" && (
            <button
              className="font-medium text-[#1a7a3d] hover:underline"
              onClick={() => setVerificationStatus(reportId, metric.id, "verified")}
            >
              Verify
            </button>
          )}
          {metric.verification_status !== "conflict" && (
            <button
              className="font-medium text-[#c02929] hover:underline"
              onClick={() => setVerificationStatus(reportId, metric.id, "conflict")}
            >
              Flag conflict
            </button>
          )}
          <button
            className="font-medium text-[#6b7580] hover:underline"
            onClick={() => deleteMetric(reportId, metric.id)}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
