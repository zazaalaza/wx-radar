'use client';

import { useEffect, useState } from 'react';
import type { RadarIndex, RadarStation } from '@/lib/index/types';

const API_PATH = '/api/radar';

function formatUtcTime(unixSeconds: number): string {
  return `${new Date(unixSeconds * 1000).toISOString().slice(11, 16)}Z`;
}

function formatUpdated(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toUTCString().replace('GMT', 'UTC');
}

export default function Home() {
  const [data, setData] = useState<RadarIndex | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(API_PATH)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as RadarIndex;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stations = data?.stations ?? [];

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 flex flex-col gap-2 border-b border-black/10 pb-6 dark:border-white/10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">WX-RADAR</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Latest weather radar loops, updated every 30 minutes.
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-black/50 dark:text-white/50">
          <a
            href={API_PATH}
            className="font-mono underline decoration-dotted underline-offset-4 hover:text-black dark:hover:text-white"
          >
            GET {API_PATH}
          </a>
          {data && (
            <span>
              {stations.length} stations &middot; updated {formatUpdated(data.updatedAt)}
            </span>
          )}
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          Failed to load radar data: {error}
        </div>
      )}

      {!error && !data && (
        <p className="text-sm text-black/50 dark:text-white/50">Loading radar data…</p>
      )}

      {data && stations.length === 0 && (
        <p className="text-sm text-black/50 dark:text-white/50">
          No captures yet. The collector will populate this once it runs.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stations.map((s) => (
          <StationCard key={s.icao} station={s} />
        ))}
      </div>
    </main>
  );
}

function StationCard({ station }: { station: RadarStation }) {
  return (
    <a
      href={`${API_PATH}?code=${station.icao}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-black/10 bg-black/[0.02] transition hover:border-black/30 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/30"
    >
      <div className="relative aspect-[568/320] w-full bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={station.gifUrl}
          alt={`${station.location} radar`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex items-baseline justify-between gap-2 px-3 pt-3">
        <span className="truncate text-base font-semibold tracking-tight">{station.location}</span>
        <span className="font-mono text-xs text-black/50 dark:text-white/50">{station.icao}</span>
      </div>
      <div className="px-3 pb-3 pt-1 font-mono text-[11px] text-black/45 dark:text-white/45">
        {formatUtcTime(station.startFrameUnixTimestamp)} → {formatUtcTime(station.endFrameUnixTimestamp)}
        {' · '}
        {station.frameCount} frames
      </div>
    </a>
  );
}
