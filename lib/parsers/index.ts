import type { SourcePlatform } from "@/types/metrics";

import { appleConfig } from "./apple.config";
import { hostingConfig } from "./hosting.config";
import { podseoConfig } from "./podseo.config";
import { spotifyConfig } from "./spotify.config";
import type { SourceConfig } from "./types";

export * from "./types";
export * from "./csv-engine";
export { appleConfig } from "./apple.config";
export { spotifyConfig } from "./spotify.config";
export { podseoConfig } from "./podseo.config";
export { hostingConfig } from "./hosting.config";

const SOURCE_CONFIGS: Record<SourcePlatform, SourceConfig> = {
  apple: appleConfig,
  spotify: spotifyConfig,
  podseo: podseoConfig,
  hosting: hostingConfig,
};

export function getSourceConfig(source: SourcePlatform): SourceConfig {
  return SOURCE_CONFIGS[source];
}
