'use client';

import { useEffect, useState } from 'react';
import type { RadarIndex, RadarStation } from '@/lib/index/types';

const API_PATH = '/api/radar';

/** Cron schedule: every 30 min at :00/:30 UTC; job needs a few min to publish. */
const CRON_INTERVAL_MS = 30 * 60 * 1000;
const JOB_BUFFER_MS = 5 * 60 * 1000;

const fmtCoord = (n: number) => `${Math.round(n)}\u00B0`;

/**
 * Estimate minutes until the next radar update.
 *
 * Boundaries fall on :00/:30 UTC. If the latest data (updatedAt) already landed
 * after the most recent boundary, this cycle is done -> aim at the next boundary;
 * otherwise this cycle is still running -> aim at the current boundary. A buffer
 * accounts for the job taking a few minutes to publish.
 */
function nextUpdateLabel(updatedAtIso: string, now: number): string | null {
  const updatedAt = new Date(updatedAtIso).getTime();
  if (Number.isNaN(updatedAt)) return null;

  const lastBoundary = Math.floor(now / CRON_INTERVAL_MS) * CRON_INTERVAL_MS;
  const nextBoundary = lastBoundary + CRON_INTERVAL_MS;
  const target = (updatedAt >= lastBoundary ? nextBoundary : lastBoundary) + JOB_BUFFER_MS;

  const minutes = Math.round((target - now) / 60000);
  if (minutes <= 0) return 'any moment now';
  return `~${minutes} min`;
}

function formatLocalHM(unixSeconds: number, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(unixSeconds * 1000));
  } catch {
    return new Date(unixSeconds * 1000).toISOString().slice(11, 16);
  }
}

export default function Home() {
  const [data, setData] = useState<RadarIndex | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    fetch(API_PATH, { cache: 'no-store' })
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

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const stations = data?.stations ?? [];
  const countdown = data?.updatedAt ? nextUpdateLabel(data.updatedAt, now) : null;

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
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.25em] text-white/40">
                Clouds + Precipitation Radar
              </span>
              {countdown && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/20 bg-sky-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-sky-300/90">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
                  Next update {countdown}
                </span>
              )}
            </div>
          </div>
          <a
            href={API_PATH}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-white/80 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
          >
            All stations
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 text-white/40 transition group-hover:text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-base font-semibold tracking-tight">{station.location}</h2>
            <span className="shrink-0 rounded-md bg-white/10 px-2 py-0.5 font-mono text-[11px] tracking-wider text-white/70">
              {station.icao}
            </span>
          </div>
          <span className="shrink-0 whitespace-nowrap font-mono text-[11px] text-white/45">
            {formatLocalHM(station.startFrameUnixTimestamp, station.timezone)} &rarr;{' '}
            {formatLocalHM(station.endFrameUnixTimestamp, station.timezone)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-white/45">
          <span className="truncate">{station.timezone}</span>
          <div className="flex shrink-0 items-center gap-3">
            <span>
              <span className="text-white/30">LAT</span> {fmtCoord(station.latitude)}{' '}
              <span className="text-white/30">LON</span> {fmtCoord(station.longitude)}
            </span>
            <a
              href={`${API_PATH}?code=${station.icao}`}
              target="_blank"
              rel="noreferrer"
              title="View raw response"
              aria-label="View raw response"
              className="-mr-1 rounded-md p-1 text-white/40 transition hover:bg-white/10 hover:text-sky-300"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
