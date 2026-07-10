import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, podcast_name, active, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <Link href="/admin/clients/new">
          <Button>New client</Button>
        </Link>
      </div>

      {!clients || clients.length === 0 ? (
        <Card className="text-center text-sm text-[#6b7580]">No clients yet.</Card>
      ) : (
        <div className="grid gap-3">
          {clients.map((client) => (
            <Link key={client.id} href={`/admin/clients/${client.id}`}>
              <Card className="flex items-center justify-between transition-shadow hover:shadow-md">
                <div>
                  <div className="font-semibold">{client.name}</div>
                  <div className="text-sm text-[#6b7580]">{client.podcast_name}</div>
                </div>
                <Badge tone={client.active ? "green" : "neutral"}>
                  {client.active ? "Active" : "Inactive"}
                </Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
