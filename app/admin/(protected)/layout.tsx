import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../login/actions";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border-subtle bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-base font-extrabold tracking-tight text-brand-pink">
              LaunchPod Media
            </Link>
            <nav className="flex gap-5 text-sm font-medium text-[#3a4149]">
              <Link href="/admin/clients" className="hover:text-brand-pink">
                Clients
              </Link>
              <Link href="/admin/reports" className="hover:text-brand-pink">
                Reports
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#6b7580]">
            <span>{user.email}</span>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
