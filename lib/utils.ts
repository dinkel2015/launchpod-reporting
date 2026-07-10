import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString("en-US");
}

export function formatPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(digits)}%`;
}

export function formatDelta(delta: number | null | undefined, previous: number | null | undefined): string | null {
  if (delta === null || delta === undefined) return null;
  const sign = delta > 0 ? "+" : "";
  if (previous !== null && previous !== undefined && previous !== 0) {
    const pct = (delta / previous) * 100;
    return `${sign}${pct.toFixed(0)}% vs prior (${formatNumber(previous)})`;
  }
  return `${sign}${formatNumber(delta)} vs prior`;
}
