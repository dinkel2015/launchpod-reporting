"use client";

import { useState, useTransition } from "react";
import { runValidation, publishReport } from "@/app/admin/reports/[id]/editor/actions";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ValidationReport } from "@/lib/validation/types";

export function ValidationPanel({ reportId, alreadyPublished }: { reportId: string; alreadyPublished: boolean }) {
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleValidate() {
    startTransition(async () => {
      const result = await runValidation(reportId);
      setReport(result);
    });
  }

  function handlePublish() {
    startTransition(async () => {
      const validation = await runValidation(reportId);
      setReport(validation);
      if (!validation.canPublish) {
        setPublishError("Resolve the blocking issues below before publishing.");
        return;
      }
      const result = await publishReport(reportId);
      setPublishError(result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validation &amp; publish</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleValidate} disabled={pending}>
            {pending ? "Checking…" : "Run validation"}
          </Button>
          <Button size="sm" onClick={handlePublish} disabled={pending || alreadyPublished}>
            {alreadyPublished ? "Published" : "Publish"}
          </Button>
        </div>
      </CardHeader>

      {publishError && <p className="mb-3 text-sm text-[#c02929]">{publishError}</p>}

      {report && (
        <div className="space-y-2">
          {report.results.map((result) => (
            <div
              key={result.checkId}
              className="flex items-start justify-between gap-3 rounded-md border border-border-subtle p-2.5 text-sm"
            >
              <div>
                <p className="font-medium">{result.label}</p>
                {!result.passed && <p className="mt-0.5 text-xs text-[#c02929]">{result.message}</p>}
              </div>
              <Badge tone={result.passed ? "green" : result.severity === "blocking" ? "red" : "amber"}>
                {result.passed ? "OK" : result.severity}
              </Badge>
            </div>
          ))}
          <p className="pt-1 text-sm font-medium">
            {report.canPublish ? (
              <span className="text-[#1a7a3d]">All blocking checks pass — ready to publish.</span>
            ) : (
              <span className="text-[#c02929]">STATUS: BLOCKED — resolve the issues above.</span>
            )}
          </p>
        </div>
      )}
    </Card>
  );
}
