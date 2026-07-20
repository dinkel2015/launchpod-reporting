import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldGroup } from "@/components/ui/field";
import { regenerateAccessToken, setClientActive, updateClientRecord } from "../actions";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single();
  if (!client) notFound();

  const { data: reports } = await supabase
    .from("reports")
    .select("id, title, report_month, status, updated_at")
    .eq("client_id", id)
    .order("reporting_period_start", { ascending: false });

  const privateLink = `${getAppUrl()}/r/${client.private_access_token}`;
  const updateClient = updateClientRecord.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-sm text-[#6b7580]">{client.podcast_name}</p>
        </div>
        <Badge tone={client.active ? "green" : "neutral"}>
          {client.active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <form action={updateClient} className="space-y-4">
            <FieldGroup>
              <Label htmlFor="name">Client name</Label>
              <Input id="name" name="name" defaultValue={client.name} required />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="podcastName">Podcast name</Label>
              <Input id="podcastName" name="podcastName" defaultValue={client.podcast_name} required />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input id="logoUrl" name="logoUrl" defaultValue={client.logo_url ?? ""} placeholder="https://…" />
            </FieldGroup>
            <Button type="submit">Save changes</Button>
          </form>

          <form action={setClientActive.bind(null, id, !client.active)} className="mt-3">
            <Button type="submit" variant="secondary" size="sm">
              {client.active ? "Disable client access" : "Re-enable client access"}
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Private report link</CardTitle>
          </CardHeader>
          <p className="mb-3 break-all rounded-md bg-surface-muted p-3 font-mono text-xs text-[#3a4149]">
            {privateLink}
          </p>
          <p className="mb-4 text-xs text-[#8b95a1]">
            Only published reports for this client are visible at this link. Regenerating invalidates the
            previous link immediately.
          </p>
          <form action={regenerateAccessToken.bind(null, id)}>
            <Button type="submit" variant="secondary" size="sm">
              Regenerate link
            </Button>
          </form>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <Link href={`/admin/reports/new?clientId=${id}`}>
            <Button size="sm">New report</Button>
          </Link>
        </CardHeader>
        {!reports || reports.length === 0 ? (
          <p className="text-sm text-[#6b7580]">No reports yet for this client.</p>
        ) : (
          <div className="divide-y divide-border-subtle">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/admin/reports/${report.id}`}
                className="flex items-center justify-between py-3 hover:text-brand-pink"
              >
                <div>
                  <div className="font-medium">{report.title}</div>
                  <div className="text-xs text-[#8b95a1]">{report.report_month}</div>
                </div>
                <Badge tone={report.status === "published" ? "green" : "neutral"}>
                  {report.status.replace(/_/g, " ")}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
