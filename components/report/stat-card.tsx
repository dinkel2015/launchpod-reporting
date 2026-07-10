import { DeltaPill, type DeltaDirection } from "./delta-pill";
import { cn } from "@/lib/utils";

export function StatCard({
  value,
  label,
  delta,
  deltaDirection = "neutral",
  sublabel,
  className,
}: {
  value: string;
  label: string;
  delta?: string;
  deltaDirection?: DeltaDirection;
  sublabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl bg-surface-muted p-5 text-center", className)}>
      <div className="text-4xl font-extrabold text-brand-pink">{value}</div>
      {delta && (
        <div className="mt-2 flex justify-center">
          <DeltaPill direction={deltaDirection} label={delta} />
        </div>
      )}
      <div className="mt-2 text-xs font-medium uppercase tracking-wide text-[#6b7580]">
        {label}
      </div>
      {sublabel && <div className="mt-0.5 text-xs text-[#8b95a1]">{sublabel}</div>}
    </div>
  );
}
