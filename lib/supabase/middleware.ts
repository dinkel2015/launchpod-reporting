import { createServerClient } from "@supabase/ssr";
import type { WebSocketLikeConstructor } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import ws from "ws";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Proxy (Next 16's renamed Middleware) defaults to the Node.js runtime,
      // which has no global WebSocket until Node 22 — supabase-js builds a
      // realtime client eagerly regardless of usage, so this is required to
      // avoid a crash on every request under Node 20/21.
      realtime: { transport: ws as unknown as WebSocketLikeConstructor },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute =
    request.nextUrl.pathname.startsWith("/admin") &&
    request.nextUrl.pathname !== "/admin/login" &&
    !request.nextUrl.pathname.startsWith("/admin/auth/");

  if (isAdminRoute && !user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
