import Link from 'next/link';
import { ArrowRight, GraduationCap, MessagesSquare, ScanEye } from 'lucide-react';

import DashboardHero from '@/components/dashboard/DashboardHero';
import MeetingTypeList from '@/components/MeetingTypeList';
import { db } from '@/lib/db';
import { getDbUser } from '@/lib/db/user';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const user = await getDbUser();
  const vods = user
    ? await db.vod.findMany({
        where: { ownerId: user.id },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        include: { _count: { select: { annotations: true } } },
      })
    : [];

  return (
    <div className="flex flex-col gap-10">
      <DashboardHero />

      <section>
        <h2 className="h-display mb-4 text-xl">Quick actions</h2>
        <MeetingTypeList />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="h-display text-xl">Recent VOD reviews</h2>
            <Link href="/vods" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {vods.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-line p-6">
              <ScanEye className="text-accent" />
              <p className="font-semibold">No reviews yet</p>
              <p className="text-sm text-ink-muted">Paste a clip, pause on the mistake and draw on it.</p>
              <Link href="/vods/new" className="btn-primary mt-1">
                Create your first review
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {vods.map((v) => (
                <li key={v.id}>
                  <Link href={`/vods/${v.id}`} className="flex items-center gap-4 py-3 transition hover:opacity-90">
                    <span className="flex-center size-10 shrink-0 rounded-xl border border-primary/30 bg-primary-soft text-primary">
                      <ScanEye size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{v.title}</p>
                      <p className="text-xs text-ink-muted">
                        {v.game ?? 'Gameplay'} · {v._count.annotations} note{v._count.annotations === 1 ? '' : 's'}
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-ink-faint" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card relative overflow-hidden p-6">
          <div className="absolute -right-16 -top-16 size-48 rounded-full bg-accent/15 blur-3xl" />
          <p className="eyebrow">On the roadmap</p>
          <h2 className="h-display mt-2 text-xl">Courses & community</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Sell structured courses and run a members-only community right inside IsnocTalks.
          </p>
          <div className="mt-5 flex flex-col gap-3">
            {[
              { icon: GraduationCap, t: 'Courses', d: 'Modules, lessons, progress tracking' },
              { icon: MessagesSquare, t: 'Community', d: 'Spaces per game, posts and clips' },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3">
                <Icon size={18} className="text-accent" />
                <div>
                  <p className="text-sm font-semibold">{t}</p>
                  <p className="text-xs text-ink-muted">{d}</p>
                </div>
                <span className="chip ml-auto">Soon</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
