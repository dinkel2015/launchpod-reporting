"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { createReport } from "../actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, FieldGroup } from "@/components/ui/field";

type ClientOption = { id: string; name: string; podcast_name: string };
type ReportOption = { id: string; title: string; report_month: string };

export function NewReportForm({
  clients,
  initialClientId,
}: {
  clients: ClientOption[];
  initialClientId: string | null;
}) {
  const [state, formAction, pending] = useActionState<{ error: string | null }, FormData>(
    createReport,
    { error: null },
  );
  const [clientId, setClientId] = useState(initialClientId ?? clients[0]?.id ?? "");
  const [previousReports, setPreviousReports] = useState<ReportOption[]>([]);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    fetch(`/api/clients/${clientId}/reports`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setPreviousReports(data.reports ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const selectedClient = clients.find((c) => c.id === clientId);

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup>
        <Label htmlFor="clientId">Client</Label>
        <Select
          id="clientId"
          name="clientId"
          required
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        >
          <option value="" disabled>
            Select a client…
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </Select>
        <Link href="/admin/clients/new" className="mt-1.5 inline-block text-xs text-brand-pink hover:underline">
          + Create new client
        </Link>
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="podcastName">Podcast name</Label>
        <Input
          id="podcastName"
          name="podcastName"
          defaultValue={selectedClient?.podcast_name ?? ""}
          key={selectedClient?.id}
          required
        />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <Label htmlFor="periodStart">Reporting period start</Label>
          <Input id="periodStart" name="periodStart" type="date" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="periodEnd">Reporting period end</Label>
          <Input id="periodEnd" name="periodEnd" type="date" required />
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label htmlFor="reportMonth">Report month</Label>
        <Input id="reportMonth" name="reportMonth" placeholder="June 2026" required />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="previousReportId">Previous report reference</Label>
        <Select id="previousReportId" name="previousReportId" defaultValue="">
          <option value="">None</option>
          {previousReports.map((report) => (
            <option key={report.id} value={report.id}>
              {report.title}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="expectedEpisodeFrequency">Expected episodes per month</Label>
        <Input
          id="expectedEpisodeFrequency"
          name="expectedEpisodeFrequency"
          type="number"
          min="0"
          placeholder="2"
        />
      </FieldGroup>

      {state.error && <p className="text-sm text-[#c02929]">{state.error}</p>}
      <Button type="submit" disabled={pending || !clientId}>
        {pending ? "Creating…" : "Create report"}
      </Button>
    </form>
  );
}
