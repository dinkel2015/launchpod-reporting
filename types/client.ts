export type BrandSettings = {
  primaryColor?: string;
  logoUrl?: string;
};

export type Client = {
  id: string;
  name: string;
  podcastName: string;
  internalSlug: string;
  privateAccessToken: string;
  logoUrl: string | null;
  brandSettings: BrandSettings | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
