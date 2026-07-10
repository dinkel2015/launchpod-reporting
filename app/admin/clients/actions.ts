"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

export async function createClientRecord(_prevState: { error: string | null }, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const podcastName = String(formData.get("podcastName") ?? "").trim();

  if (!name || !podcastName) {
    return { error: "Client name and podcast name are required." };
  }

  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({ name, podcast_name: podcastName, internal_slug: slugify(name) })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${data.id}`);
}

export async function updateClientRecord(clientId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const podcastName = String(formData.get("podcastName") ?? "").trim();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();

  const supabase = await createSupabaseClient();
  await supabase
    .from("clients")
    .update({ name, podcast_name: podcastName, logo_url: logoUrl || null })
    .eq("id", clientId);

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/clients");
}

export async function regenerateAccessToken(clientId: string) {
  const supabase = await createSupabaseClient();
  const { data: tokenData, error } = await supabase.rpc("generate_access_token");
  if (error || !tokenData) return;

  await supabase
    .from("clients")
    .update({ private_access_token: tokenData })
    .eq("id", clientId);

  revalidatePath(`/admin/clients/${clientId}`);
}

export async function setClientActive(clientId: string, active: boolean) {
  const supabase = await createSupabaseClient();
  await supabase.from("clients").update({ active }).eq("id", clientId);
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/clients");
}
