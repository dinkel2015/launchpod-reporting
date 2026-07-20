"use client";

import { useActionState } from "react";
import { signIn, signInWithGoogle } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldGroup } from "@/components/ui/field";

export function LoginForm({ next, error }: { next: string; error?: string }) {
  const [state, formAction, pending] = useActionState<{ error: string | null }, FormData>(signIn, {
    error: null,
  });

  return (
    <div className="space-y-4">
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <Button type="submit" variant="secondary" className="w-full">
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M19.6 10.23c0-.68-.06-1.32-.17-1.94H10v3.86h5.38a4.6 4.6 0 0 1-2 3.02v2.4h3.23c1.9-1.75 2.99-4.32 2.99-7.34Z"
            />
            <path
              fill="#34A853"
              d="M10 20c2.7 0 4.96-.89 6.61-2.43l-3.23-2.4c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.75-5.59-4.11H1.08v2.48A10 10 0 0 0 10 20Z"
            />
            <path
              fill="#FBBC05"
              d="M4.41 11.02a5.99 5.99 0 0 1 0-3.84V4.7H1.08a10 10 0 0 0 0 8.8l3.33-2.48Z"
            />
            <path
              fill="#EA4335"
              d="M10 3.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.96 9.96 0 0 0 10 0 10 10 0 0 0 1.08 4.7l3.33 2.48C5.2 5.71 7.4 3.96 10 3.96Z"
            />
          </svg>
          Continue with Google
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-[#8b95a1]">
        <div className="h-px flex-1 bg-border-subtle" />
        or
        <div className="h-px flex-1 bg-border-subtle" />
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <FieldGroup>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="username" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </FieldGroup>
        {(state.error || error) && <p className="text-sm text-[#c02929]">{state.error ?? error}</p>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
