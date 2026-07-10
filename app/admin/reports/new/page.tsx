import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { NewReportForm } from "./new-report-form";

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, podcast_name")
    .eq("active", true)
    .order("name");

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">New report</h1>
      <Card>
        <NewReportForm clients={clients ?? []} initialClientId={clientId ?? null} />
      </Card>
    </div>
  );
}
