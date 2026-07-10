import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border-subtle bg-surface p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="text-lg font-extrabold tracking-tight text-brand-pink">LaunchPod Media</div>
          <p className="mt-1 text-sm text-[#6b7580]">Admin sign in</p>
        </div>
        <LoginForm next={next ?? "/admin"} />
      </div>
    </div>
  );
}
