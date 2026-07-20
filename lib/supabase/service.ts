import "server-only";
import { createClient as createSupabaseClient, type WebSocketLikeConstructor } from "@supabase/supabase-js";
import ws from "ws";
import type { Database } from "@/types/database";

/**
 * Service-role client. Bypasses RLS entirely — only ever use this after the
 * caller has already been authorized some other way (e.g. a validated
 * client-report access token). Never import this into a Client Component.
 */
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      // Node's nodejs runtime (Vercel functions included) has no global
      // WebSocket until Node 22 — supabase-js constructs a realtime client
      // eagerly regardless of whether realtime is used, so this is required
      // to avoid a crash on every request under Node 20/21.
      realtime: { transport: ws as unknown as WebSocketLikeConstructor },
    },
  );
}
