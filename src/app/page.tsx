'use client';

import { useEffect, useState } from 'react';
import type { RadarIndex, RadarStation } from '@/lib/index/types';

const API_PATH = '/api/radar';

const fmtCoord = (n: number) => `${n >= 0 ? '' : '-'}${Math.abs(n).toFixed(3)}\u00B0`;

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
      .then((json) => !cancelled && setData(json))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : String(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  const stations = data?.stations ?? [];

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.10),_transparent_60%)]"
      />

      <header className="sticky top-0 z-10 border-b border-white/10 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-[0.2em]">WX&middot;RADAR</span>
            <span className="text-[11px] uppercase tracking-[0.25em] text-white/40">
              Global radar loops
            </span>
          </div>
          <a
            href={API_PATH}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-white/80 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
          >
            All stations
            <span className="text-white/40 transition group-hover:translate-x-0.5 group-hover:text-white">
              &#8599;
            </span>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 sm:py-10">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Failed to load radar data: {error}
          </div>
        )}

        {!error && !data && (
          <div className="flex items-center gap-3 text-sm text-white/40">
            <span className="h-2 w-2 animate-pulse rounded-full bg-sky-400" />
            Loading radar data…
          </div>
        )}

        {data && stations.length === 0 && (
          <p className="text-sm text-white/40">
            No captures yet — the collector will populate this on its next run.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {stations.map((s) => (
            <StationCard key={s.icao} station={s} />
          ))}
        </div>
      </main>
    </div>
  );
}

function StationCard({ station }: { station: RadarStation }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition duration-200 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.04] hover:shadow-[0_12px_40px_-12px_rgba(56,189,248,0.25)]">
      <div className="relative aspect-[568/320] w-full overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={station.gifUrl}
          alt={`${station.location} radar`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="truncate text-base font-semibold tracking-tight">{station.location}</h2>
          <span className="shrink-0 rounded-md bg-white/10 px-2 py-0.5 font-mono text-[11px] tracking-wider text-white/70">
            {station.icao}
          </span>
        </div>

        <div className="flex items-center gap-4 font-mono text-[11px] text-white/45">
          <span>
            <span className="text-white/30">LAT</span> {fmtCoord(station.latitude)}
          </span>
          <span>
            <span className="text-white/30">LON</span> {fmtCoord(station.longitude)}
          </span>
        </div>

        <a
          href={`${API_PATH}?code=${station.icao}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-sky-300/80 transition hover:text-sky-200"
        >
          View raw response
          <span aria-hidden>&#8599;</span>
        </a>
      </div>
    </div>
  );
}
