/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { Film, Link2, Plus, ScanEye } from 'lucide-react';

import PageHeader from '@/components/layout/PageHeader';
import { db } from '@/lib/db';
import { requireDbUser } from '@/lib/db/user';
import { getYouTubeId } from '@/lib/vod/source';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'VOD Reviews' };

export default async function VodsPage() {
  const user = await requireDbUser();
  const vods = await db.vod.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { annotations: true } } },
  });

  return (
    <section>
      <PageHeader
        eyebrow="Train"
        title="VOD reviews"
        description="Break down gameplay frame by frame, draw on mistakes and send the review to your student."
        actions={
          <Link href="/vods/new" className="btn-primary">
            <Plus size={16} /> New review
          </Link>
        }
      />

      {vods.length === 0 ? (
        <div className="card relative flex flex-col items-center overflow-hidden px-6 py-16 text-center">
          <div className="absolute inset-0 bg-grid opacity-60 mask-fade-b" />
          <span className="flex-center relative size-14 rounded-2xl border border-primary/40 bg-primary-soft text-primary shadow-glow">
            <ScanEye size={26} />
          </span>
          <p className="h-display relative mt-5 text-2xl">No reviews yet</p>
          <p className="relative mt-2 max-w-md text-ink-muted">
            Paste a YouTube or video link to start your first breakdown.
          </p>
          <Link href="/vods/new" className="btn-primary relative mt-6">
            <Plus size={16} /> Create a review
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {vods.map((v) => {
            const yt = v.source === 'YOUTUBE' ? getYouTubeId(v.videoUrl) : null;
            return (
              <Link key={v.id} href={`/vods/${v.id}`} className="card card-hover group flex flex-col overflow-hidden">
                <div className="relative aspect-video overflow-hidden bg-surface-2">
                  {yt ? (
                    <img
                      src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`}
                      alt=""
                      className="size-full object-cover opacity-80 transition duration-300 group-hover:scale-105 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="flex-center size-full bg-grid">
                      <Film size={32} className="text-ink-faint" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent" />
                  <span className="chip absolute left-3 top-3 border-white/10 bg-black/60 backdrop-blur">
                    {v.game ?? 'Gameplay'}
                  </span>
                  {v.visibility === 'LINK' && (
                    <span className="chip absolute right-3 top-3 border-accent/40 bg-black/60 text-accent backdrop-blur">
                      <Link2 size={12} /> Shared
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h2 className="line-clamp-2 font-display text-lg font-semibold">{v.title}</h2>
                  <p className="mt-auto text-sm text-ink-muted">
                    <span className="font-semibold text-primary">{v._count.annotations}</span> note
                    {v._count.annotations === 1 ? '' : 's'} · updated{' '}
                    {v.updatedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
