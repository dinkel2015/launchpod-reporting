import type { CoverContent } from "@/types/sections";

export function Cover({ content }: { content: CoverContent }) {
  return (
    <div className="rounded-2xl bg-[#12081a] p-12 text-center text-white">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
        LaunchPod Media · Monthly Report
      </p>
      <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-brand-pink">
        {content.clientName}
      </h1>
      {content.tagline && <p className="mt-2 text-lg text-white/80">{content.tagline}</p>}
      <div className="mx-auto mt-8 flex max-w-md justify-between text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/50">Hosts</p>
          <p className="mt-1 font-medium">{content.hosts}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/50">Report month</p>
          <p className="mt-1 font-medium">{content.reportMonth}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/50">Total episodes</p>
          <p className="mt-1 font-medium">{content.totalEpisodes} Episodes</p>
        </div>
      </div>
    </div>
  );
}
