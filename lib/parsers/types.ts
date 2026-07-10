import type { MetricUnit, SourcePlatform } from "@/types/metrics";

export type ColumnMapping = {
  metricKey: string;
  /** Canonical header text as the source platform itself labels this field; carried through to ReportMetric.originalLabel. */
  originalLabel: string;
  unit: MetricUnit;
  /** All header spellings/aliases this source is known to use for this metric (matched case-insensitively, trimmed). */
  acceptedHeaders: readonly string[];
  /**
   * Some exports repeat one generic header (e.g. "Visibility Rank", "Percentage") across many rows,
   * once per entity (competitor, country, keyword) named in a sibling column. When set, the entity's
   * slugified value from that sibling header is appended to `metricKey` so each entity gets its own
   * key — mirrors the *_PREFIX constants in types/metrics.ts (e.g. PODSEO_COMPETITOR_RANK_PREFIX).
   */
  dynamicKeySuffixFrom?: string;
  transform?: (rawValue: string) => number | string | null;
};

export type SourceConfig = {
  source: SourcePlatform;
  columns: readonly ColumnMapping[];
  /** Hints for resolving ambiguous date strings (e.g. which of DD/MM vs MM/DD this source uses). */
  dateFormatHints?: readonly string[];
  /** Set only when every "rank"-unit metric in this source improves as the number goes down. */
  rankDirection?: "lower_is_better" | "higher_is_better";
};

export type ParsedRow = {
  rowIndex: number;
  metricKey: string;
  originalLabel: string;
  header: string;
  rawValue: string;
  value: number | string | null;
  unit: MetricUnit;
};

export type ParseError = {
  rowIndex: number | null;
  header: string | null;
  message: string;
};

export type ParseResult = {
  source: SourcePlatform;
  rows: ParsedRow[];
  detectedHeaders: string[];
  unmappedHeaders: string[];
  errors: ParseError[];
};

export type CsvPreview = {
  headers: string[];
  rows: Array<Record<string, string>>;
  truncated: boolean;
};
