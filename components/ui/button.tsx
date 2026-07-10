import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand-pink text-white hover:bg-[#c9126b] disabled:bg-[#f2a9c8]",
  secondary:
    "bg-white text-[#171717] border border-border-subtle hover:bg-surface-muted disabled:opacity-50",
  ghost: "bg-transparent text-[#171717] hover:bg-surface-muted disabled:opacity-50",
  danger: "bg-[#c02929] text-white hover:bg-[#a02020] disabled:bg-[#e3a3a3]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
