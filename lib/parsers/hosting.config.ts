// Downloads/plays totals must never be taken from this source for the total-downloads calculation —
// see lib/rules (downloads = apple_plays + spotify_plays only). Spreaker's hosting numbers use a
// different counting methodology than Apple/Spotify's own dashboards and would double-count if folded in.

import { METRIC_KEYS } from "@/types/metrics";

import type { ColumnMapping, SourceConfig } from "./types";

// This source is thin in the real sample data: only a device/OS breakdown was found in the source
// deck we cataloged from. A fuller Spreaker export is expected to also include day-of-week publishing
// patterns and per-episode hosting downloads, but neither was present in the sample, so we don't
// invent ColumnMapping entries for them. Stubs below show how to extend this file once real field
// labels are confirmed from an actual export.

const DEVICES = ["Phone", "Desktop", "Other"] as const;
const deviceShare: ColumnMapping[] = DEVICES.map((device) => ({
  metricKey: `${METRIC_KEYS.HOSTING_DEVICE_SHARE_PREFIX}${device.toLowerCase()}`,
  originalLabel: device,
  unit: "percent",
  acceptedHeaders: [device],
}));

const HOSTING_OS_SHARE_PREFIX = "hosting_os_share_";
const OPERATING_SYSTEMS = ["iOS", "Android", "Windows", "Mac OS", "Linux", "Other"] as const;
const osShare: ColumnMapping[] = OPERATING_SYSTEMS.map((os) => ({
  metricKey: `${HOSTING_OS_SHARE_PREFIX}${os.toLowerCase().replace(/\s+/g, "_")}`,
  originalLabel: os,
  unit: "percent",
  acceptedHeaders: [os],
}));

export const hostingConfig: SourceConfig = {
  source: "hosting",
  columns: [...deviceShare, ...osShare],
};

// --- Extend here once a fuller Spreaker export is available ---
//
// Day-of-week publishing pattern (METRIC_KEYS.HOSTING_DAY_OF_WEEK_PREFIX = "hosting_day_of_week_"),
// all unit: "count":
//
// { metricKey: `${METRIC_KEYS.HOSTING_DAY_OF_WEEK_PREFIX}mon`, originalLabel: "Monday", unit: "count", acceptedHeaders: ["Monday", "Mon"] },
// { metricKey: `${METRIC_KEYS.HOSTING_DAY_OF_WEEK_PREFIX}tue`, originalLabel: "Tuesday", unit: "count", acceptedHeaders: ["Tuesday", "Tue"] },
// { metricKey: `${METRIC_KEYS.HOSTING_DAY_OF_WEEK_PREFIX}wed`, originalLabel: "Wednesday", unit: "count", acceptedHeaders: ["Wednesday", "Wed"] },
// { metricKey: `${METRIC_KEYS.HOSTING_DAY_OF_WEEK_PREFIX}thu`, originalLabel: "Thursday", unit: "count", acceptedHeaders: ["Thursday", "Thu"] },
// { metricKey: `${METRIC_KEYS.HOSTING_DAY_OF_WEEK_PREFIX}fri`, originalLabel: "Friday", unit: "count", acceptedHeaders: ["Friday", "Fri"] },
// { metricKey: `${METRIC_KEYS.HOSTING_DAY_OF_WEEK_PREFIX}sat`, originalLabel: "Saturday", unit: "count", acceptedHeaders: ["Saturday", "Sat"] },
// { metricKey: `${METRIC_KEYS.HOSTING_DAY_OF_WEEK_PREFIX}sun`, originalLabel: "Sunday", unit: "count", acceptedHeaders: ["Sunday", "Sun"] },
//
// Per-episode hosting downloads (episode identifier column + a "Downloads" count column) — pending
// confirmation of the real header labels from a fuller Spreaker export.
