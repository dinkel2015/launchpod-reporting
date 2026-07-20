import { createServerClient } from "@supabase/ssr";
import type { WebSocketLikeConstructor } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import ws from "ws";
import type { Database } from "@/types/database";

/** Auth-aware server client — respects RLS as the signed-in admin user. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Node's nodejs runtime (Vercel functions included) has no global
      // WebSocket until Node 22 — supabase-js constructs a realtime client
      // eagerly regardless of whether realtime is used, so this is required
      // to avoid a crash on every request under Node 20/21.
      realtime: { transport: ws as unknown as WebSocketLikeConstructor },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component; middleware refreshes the
            // session cookie instead, so this is safe to ignore.
          }
        },
      },
    },
  );
}
