import { formatNumber } from "@/lib/utils";

/** Per the visual-design rule: the largest value in the set must always render at 100%. */
export function BarRow({
  label,
  value,
  maxValue,
  displayValue,
}: {
  label: string;
  value: number;
  maxValue: number;
  displayValue?: string;
}) {
  const widthPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-24 shrink-0 text-sm text-[#3a4149]">{label}</div>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-brand-pink"
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      <div className="w-16 shrink-0 text-right text-sm font-medium text-[#171717]">
        {displayValue ?? formatNumber(value)}
      </div>
    </div>
  );
}
