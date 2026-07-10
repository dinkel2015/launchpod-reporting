import { cn } from "@/lib/utils";

export type DeltaDirection = "positive" | "negative" | "neutral";

export function DeltaPill({
  direction,
  label,
  className,
}: {
  direction: DeltaDirection;
  label: string;
  className?: string;
}) {
  const toneClasses: Record<DeltaDirection, string> = {
    positive: "bg-[#dff5e6] text-[#1a7a3d]",
    negative: "bg-[#fbe4e4] text-[#c02929]",
    neutral: "bg-[#eceef0] text-[#55606b]",
  };
  const arrow = direction === "positive" ? "▲" : direction === "negative" ? "▼" : "";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClasses[direction],
        className,
      )}
    >
      {arrow && <span aria-hidden>{arrow}</span>}
      {label}
    </span>
  );
}

/** Direction is a display concern derived from a metric's semantics, not just delta sign — a rank metric where lower is better must invert this before calling DeltaPill. */
export function directionFromDelta(delta: number | null | undefined): DeltaDirection {
  if (delta === null || delta === undefined || delta === 0) return "neutral";
  return delta > 0 ? "positive" : "negative";
}
