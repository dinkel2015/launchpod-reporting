import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type CalloutTone = "info" | "focus" | "big_picture" | "positive";

const toneStyles: Record<CalloutTone, { bg: string; border: string }> = {
  info: { bg: "bg-[#e3f6f8]", border: "border-[#0fb5c4]" },
  focus: { bg: "bg-[#fdf1de]", border: "border-[#e08b1f]" },
  big_picture: { bg: "bg-[#fbe4ee]", border: "border-brand-pink" },
  positive: { bg: "bg-[#e2f6ea]", border: "border-[#1f9e4c]" },
};

export function CalloutCard({
  tone,
  icon,
  title,
  children,
  className,
}: {
  tone: CalloutTone;
  icon?: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const styles = toneStyles[tone];
  return (
    <div
      className={cn("rounded-lg border-l-4 p-4", styles.bg, styles.border, className)}
    >
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#3a4149]">
        {icon}
        {title}
      </div>
      <div className="text-sm leading-relaxed text-[#171717]">{children}</div>
    </div>
  );
}
