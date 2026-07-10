import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Tone = "neutral" | "pink" | "green" | "amber" | "red" | "lpm" | "client";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-muted text-[#3a4149]",
  pink: "bg-brand-pink-tint text-brand-pink",
  green: "bg-[#dff5e6] text-[#1a7a3d]",
  amber: "bg-[#fdf1de] text-[#8a5a12]",
  red: "bg-[#fbe4e4] text-[#c02929]",
  lpm: "bg-[#171717] text-white",
  client: "bg-[#e3f6f8] text-[#0f7a86]",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
