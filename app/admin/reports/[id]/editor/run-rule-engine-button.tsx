"use client";

import { useTransition } from "react";
import { runRuleEngineAction } from "./actions";
import { Button } from "@/components/ui/button";

export function RunRuleEngineButton({ reportId }: { reportId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={pending}
      onClick={() => startTransition(() => runRuleEngineAction(reportId))}
    >
      {pending ? "Running rules…" : "Run rule engine"}
    </Button>
  );
}
