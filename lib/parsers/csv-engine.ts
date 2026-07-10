import Papa from "papaparse";

import type { ColumnMapping, CsvPreview, ParseError, ParsedRow, ParseResult, SourceConfig } from "./types";

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, " ");
}

// A header can carry candidates rather than a single mapping: e.g. PodSEO's "Visibility Rank" means
// the show's own rank in its overview export, but a competitor's rank in the competitor-comparison
// export. Both live in one SourceConfig because a single "podseo" upload's file could be either.
function buildHeaderLookup(config: SourceConfig): Map<string, ColumnMapping[]> {
  const lookup = new Map<string, ColumnMapping[]>();
  for (const column of config.columns) {
    for (const alias of column.acceptedHeaders) {
      const key = normalizeHeader(alias);
      const existing = lookup.get(key);
      if (existing) existing.push(column);
      else lookup.set(key, [column]);
    }
  }
  return lookup;
}

function getFieldValue(record: Record<string, string>, headerName: string): string {
  const normalized = normalizeHeader(headerName);
  for (const key of Object.keys(record)) {
    if (normalizeHeader(key) === normalized) return (record[key] ?? "").trim();
  }
  return "";
}

// Disambiguates same-named headers using row context: a row that actually has a value in the
// dynamic-key sibling column (e.g. "Competitor") is a competitor-table row; a row without one is
// the plain overview row. Falls back to the static (non-dynamic) candidate, then the first one.
function resolveMapping(candidates: ColumnMapping[], record: Record<string, string>): ColumnMapping {
  if (candidates.length === 1) return candidates[0];
  const contextMatch = candidates.find(
    (candidate) => candidate.dynamicKeySuffixFrom && getFieldValue(record, candidate.dynamicKeySuffixFrom) !== "",
  );
  if (contextMatch) return contextMatch;
  return candidates.find((candidate) => !candidate.dynamicKeySuffixFrom) ?? candidates[0];
}

/** Strips thousands-separator commas and a trailing "%" — percent values are kept on a 0-100 scale, not rescaled to 0-1. */
export function parseNumericCell(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").replace(/%$/, "").trim();
  if (cleaned === "") return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

/** Converts "MM:SS" or "H:MM:SS" episode-duration strings into fractional minutes. */
export function parseDurationToMinutes(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const parts = trimmed.split(":").map((part) => Number(part));
  if (parts.length === 0 || parts.some((part) => Number.isNaN(part))) return null;

  let totalSeconds = 0;
  for (const part of parts) totalSeconds = totalSeconds * 60 + part;
  return totalSeconds / 60;
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;
const SLASH_DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

/**
 * Normalizes ISO, "Jun 4, 2026", and "MM/DD/YYYY" (or "DD/MM/YYYY" via `hints`) style dates to "YYYY-MM-DD".
 * Exported standalone rather than wired into a ColumnMapping: MetricUnit has no "date" variant, so
 * date-labeled columns (episode Release Date, etc.) are never modeled as metrics — callers use this to
 * populate ReportMetric.periodStart/periodEnd/snapshotDate or ReportUpload.snapshotDate directly.
 */
export function normalizeDate(raw: string, hints?: readonly string[]): string | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;

  const isoMatch = ISO_DATE_PATTERN.exec(trimmed);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${year}-${month}-${day}`;
  }

  const slashMatch = SLASH_DATE_PATTERN.exec(trimmed);
  if (slashMatch) {
    const [, first, second, year] = slashMatch;
    const dayFirst = hints?.includes("DD/MM/YYYY") ?? false;
    const month = dayFirst ? second : first;
    const day = dayFirst ? first : second;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Turns an entity label (competitor name, country, keyword) into a metric-key-safe suffix. */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function composeMetricKey(mapping: ColumnMapping, suffixSource: string): string {
  const base = mapping.metricKey.endsWith("_") ? mapping.metricKey : `${mapping.metricKey}_`;
  return `${base}${slugify(suffixSource)}`;
}

/**
 * Parses CSV text against a SourceConfig. Never throws for headers it doesn't recognize — those are
 * surfaced via `unmappedHeaders` so the upload UI can offer manual mapping. Only fundamentally
 * unusable input (no text, no header row) throws.
 */
export function parseCsv(text: string, config: SourceConfig): ParseResult {
  if (text.trim() === "") {
    throw new Error("Cannot parse an empty CSV file.");
  }

  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const detectedHeaders = parsed.meta.fields ?? [];
  if (detectedHeaders.length === 0) {
    throw new Error("CSV has no header row.");
  }

  const lookup = buildHeaderLookup(config);
  const unmappedHeaders = detectedHeaders.filter((header) => !lookup.has(normalizeHeader(header)));

  const rows: ParsedRow[] = [];
  const errors: ParseError[] = [];

  parsed.data.forEach((record, rowIndex) => {
    for (const header of detectedHeaders) {
      const candidates = lookup.get(normalizeHeader(header));
      if (!candidates) continue;
      const mapping = resolveMapping(candidates, record);

      const rawValue = (record[header] ?? "").trim();

      let metricKey = mapping.metricKey;
      if (mapping.dynamicKeySuffixFrom) {
        const suffixSource = getFieldValue(record, mapping.dynamicKeySuffixFrom);
        if (suffixSource === "") {
          errors.push({
            rowIndex,
            header,
            message: `Cannot compose metric key for "${header}": sibling column "${mapping.dynamicKeySuffixFrom}" is empty on this row.`,
          });
          continue;
        }
        metricKey = composeMetricKey(mapping, suffixSource);
      }

      // Blank cells are meaningful (e.g. PodSEO "not ranking in top 50"), not parse failures.
      if (rawValue === "") {
        rows.push({ rowIndex, metricKey, originalLabel: mapping.originalLabel, header, rawValue, value: null, unit: mapping.unit });
        continue;
      }

      let value: number | string | null;
      if (mapping.transform) {
        value = mapping.transform(rawValue);
      } else {
        value = parseNumericCell(rawValue);
        if (value === null) {
          errors.push({
            rowIndex,
            header,
            message: `Could not parse "${rawValue}" from column "${header}" as a number.`,
          });
        }
      }

      rows.push({ rowIndex, metricKey, originalLabel: mapping.originalLabel, header, rawValue, value, unit: mapping.unit });
    }
  });

  return { source: config.source, rows, detectedHeaders, unmappedHeaders, errors };
}

/** Lets the upload UI show a quick preview of the raw CSV before the user commits to parsing it against a config. */
export function previewRows(text: string, maxRows = 10): CsvPreview {
  if (text.trim() === "") {
    throw new Error("Cannot preview an empty CSV file.");
  }

  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const headers = parsed.meta.fields ?? [];
  if (headers.length === 0) {
    throw new Error("CSV has no header row.");
  }

  return {
    headers,
    rows: parsed.data.slice(0, maxRows),
    truncated: parsed.data.length > maxRows,
  };
}
