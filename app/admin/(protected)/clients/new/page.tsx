"use client";

import { useActionState } from "react";
import { createClientRecord } from "../actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldGroup } from "@/components/ui/field";

export default function NewClientPage() {
  const [state, formAction, pending] = useActionState<{ error: string | null }, FormData>(
    createClientRecord,
    { error: null },
  );

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">New client</h1>
      <Card>
        <form action={formAction}>
          <FieldGroup>
            <Label htmlFor="name">Client name</Label>
            <Input id="name" name="name" required placeholder="MountainWest Capital Network" />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="podcastName">Podcast name</Label>
            <Input id="podcastName" name="podcastName" required placeholder="Welcome to the Winners' Circle" />
          </FieldGroup>
          {state.error && <p className="mb-4 text-sm text-[#c02929]">{state.error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create client"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
