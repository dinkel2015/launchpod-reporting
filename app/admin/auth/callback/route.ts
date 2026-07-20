import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Any Google account can complete OAuth — this is the one place that turns
// "signed in with Google" into "authorized LaunchPod admin". Sign the
// session back out immediately if the email domain doesn't match, so no
// unauthorized session is ever left standing.
const ALLOWED_DOMAIN = process.env.ADMIN_EMAIL_DOMAIN?.toLowerCase();

function failure(origin: string, detail: string) {
  return NextResponse.redirect(
    `${origin}/admin/login?error=${encodeURIComponent(`Sign-in failed: ${detail}`)}`,
  );
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  // Supabase/Google redirect back with these instead of `code` when the
  // OAuth attempt itself failed (denied consent, redirect not allowlisted,
  // provider misconfigured, etc).
  const oauthError = searchParams.get("error_description") ?? searchParams.get("error");
  if (oauthError) {
    return failure(origin, oauthError);
  }

  if (!code) {
    return failure(origin, "no authorization code was returned.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return failure(origin, error.message);
  }

  const domain = data.user?.email?.split("@")[1]?.toLowerCase();

  if (ALLOWED_DOMAIN && domain !== ALLOWED_DOMAIN) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent(
        "Your Google account isn't authorized for admin access.",
      )}`,
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
