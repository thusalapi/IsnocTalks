'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { CalendarClock, Radio } from 'lucide-react';

import { useGetCalls } from '@/hooks/useGetCalls';

export default function DashboardHero() {
  const { user } = useUser();
  const { upcomingCalls } = useGetCalls();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const next = useMemo(() => {
    const list = [...(upcomingCalls ?? [])].sort(
      (a, b) => (a.state.startsAt?.getTime() ?? 0) - (b.state.startsAt?.getTime() ?? 0)
    );
    return list[0];
  }, [upcomingCalls]);

  const name = user?.firstName || user?.username || 'player';
  const hour = now?.getHours() ?? 12;
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <section className="card relative overflow-hidden p-6 sm:p-8">
      <div className="absolute inset-0 bg-grid opacity-60 mask-fade-b" />
      <div className="absolute -right-24 -top-24 size-72 rounded-full bg-primary/30 blur-3xl" />
      <div className="absolute -bottom-28 right-40 size-60 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">{greeting}</p>
          <h1 className="h-display mt-2 text-3xl sm:text-5xl">
            Ready to grind, <span className="text-gradient">{name}</span>?
          </h1>
          <p className="mt-3 max-w-xl text-ink-muted">
            Run a live session, break down a VOD or line up your next coaching block.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/personal-room" className="btn-primary">
              <Radio size={16} /> Open coaching room
            </Link>
            <Link href="/vods/new" className="btn-ghost">
              Review a VOD
            </Link>
          </div>
        </div>

        <div className="glassmorphism min-w-[260px] rounded-2xl border border-line p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            <CalendarClock size={14} className="text-accent" /> Next session
          </div>
          {next ? (
            <>
              <p className="mt-3 line-clamp-1 font-display text-lg font-semibold">
                {next.state.custom?.description || 'Coaching session'}
              </p>
              <p className="text-sm text-ink-muted">
                {next.state.startsAt?.toLocaleString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <Link href={`/meeting/${next.id}`} className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
                Join when ready →
              </Link>
            </>
          ) : (
            <>
              <p className="mt-3 font-display text-lg font-semibold">Nothing scheduled</p>
              <p className="text-sm text-ink-muted">Schedule a session below.</p>
            </>
          )}
          <p className="mt-4 border-t border-line pt-3 font-display text-3xl font-bold tabular-nums">
            {now ? now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </p>
          <p className="text-xs text-ink-muted">
            {now ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(now) : ''}
          </p>
        </div>
      </div>
    </section>
  );
}
