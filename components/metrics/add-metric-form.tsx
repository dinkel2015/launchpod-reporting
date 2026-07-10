"use client";

import { useActionState } from "react";
import { addMetric } from "@/app/admin/reports/[id]/metrics/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, FieldGroup } from "@/components/ui/field";

export function AddMetricForm({ reportId }: { reportId: string }) {
  const [state, formAction, pending] = useActionState<{ error: string | null }, FormData>(addMetric, {
    error: null,
  });

  return (
    <form action={formAction} className="grid grid-cols-2 gap-3 rounded-lg border border-border-subtle p-4 md:grid-cols-4">
      <input type="hidden" name="reportId" value={reportId} />

      <FieldGroup className="mb-0">
        <Label htmlFor="sourceType">Source</Label>
        <Select id="sourceType" name="sourceType" defaultValue="apple" required>
          <option value="apple">Apple</option>
          <option value="spotify">Spotify</option>
          <option value="podseo">PodSEO</option>
          <option value="hosting">Hosting</option>
        </Select>
      </FieldGroup>

      <FieldGroup className="mb-0">
        <Label htmlFor="originalLabel">Original label</Label>
        <Input id="originalLabel" name="originalLabel" placeholder="Plays" required />
      </FieldGroup>

      <FieldGroup className="mb-0">
        <Label htmlFor="metricKey">Metric key</Label>
        <Input id="metricKey" name="metricKey" placeholder="apple_plays" required />
      </FieldGroup>

      <FieldGroup className="mb-0">
        <Label htmlFor="displayLabel">Display label</Label>
        <Input id="displayLabel" name="displayLabel" placeholder="Apple Plays" required />
      </FieldGroup>

      <FieldGroup className="mb-0">
        <Label htmlFor="value">Value</Label>
        <Input id="value" name="value" placeholder="342" required />
      </FieldGroup>

      <FieldGroup className="mb-0">
        <Label htmlFor="unit">Unit</Label>
        <Select id="unit" name="unit" defaultValue="count">
          <option value="count">count</option>
          <option value="percent">percent</option>
          <option value="minutes">minutes</option>
          <option value="hours">hours</option>
          <option value="rank">rank</option>
          <option value="score">score</option>
        </Select>
      </FieldGroup>

      <FieldGroup className="mb-0">
        <Label htmlFor="authorityLevel">Authority</Label>
        <Select id="authorityLevel" name="authorityLevel" defaultValue="manual_verified">
          <option value="authoritative_csv">Authoritative CSV</option>
          <option value="platform_export">Platform export</option>
          <option value="verified_screenshot">Verified screenshot</option>
          <option value="manual_verified">Manual verified</option>
        </Select>
      </FieldGroup>

      <FieldGroup className="mb-0">
        <Label htmlFor="snapshotDate">Snapshot date</Label>
        <Input id="snapshotDate" name="snapshotDate" type="date" />
      </FieldGroup>

      <FieldGroup className="col-span-2 mb-0">
        <Label htmlFor="sourceReference">Source reference</Label>
        <Input id="sourceReference" name="sourceReference" placeholder="Apple Podcasts Connect — Overview tab" required />
      </FieldGroup>

      <FieldGroup className="mb-0">
        <Label htmlFor="sourcePage">Source page</Label>
        <Input id="sourcePage" name="sourcePage" type="number" min="1" />
      </FieldGroup>

      <div className="col-span-2 flex items-end md:col-span-4">
        {state.error && <p className="mr-4 text-sm text-[#c02929]">{state.error}</p>}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Adding…" : "Add metric"}
        </Button>
      </div>
    </form>
  );
}
