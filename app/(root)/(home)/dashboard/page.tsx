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

  const learning = user
    ? await db.enrollment.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: { course: { select: { id: true, title: true, slug: true } } },
      })
    : null;
  let learningPct = 0;
  if (user && learning) {
    const [total, done] = await Promise.all([
      db.lesson.count({ where: { module: { courseId: learning.courseId } } }),
      db.lessonProgress.count({ where: { userId: user.id, lesson: { module: { courseId: learning.courseId } } } }),
    ]);
    learningPct = total ? Math.round((done / total) * 100) : 0;
  }
  const memberships = user ? await db.spaceMember.findMany({ where: { userId: user.id }, select: { spaceId: true } }) : [];
  const spaceCount = memberships.length;
  const newPosts = spaceCount
    ? await db.post.count({
        where: {
          spaceId: { in: memberships.map((m) => m.spaceId) },
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) },
        },
      })
    : 0;

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
          <p className="eyebrow">Keep learning</p>
          {learning ? (
            <>
              <h2 className="h-display mt-2 line-clamp-2 text-xl">{learning.course.title}</h2>
              <div className="mt-4 h-2 rounded-full bg-surface-3">
                <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${learningPct}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-ink-muted">{learningPct}% complete</p>
              <Link href={`/courses/${learning.course.slug}`} className="btn-primary mt-4 w-full">
                <GraduationCap size={16} /> Continue course
              </Link>
            </>
          ) : (
            <>
              <h2 className="h-display mt-2 text-xl">Courses & community</h2>
              <p className="mt-2 text-sm text-ink-muted">Take a structured course or join a space to learn with other players.</p>
              <Link href="/courses" className="btn-primary mt-4 w-full">
                <GraduationCap size={16} /> Browse courses
              </Link>
            </>
          )}
          <Link
            href="/community"
            className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3 transition hover:border-line-strong"
          >
            <MessagesSquare size={18} className="text-accent" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Community</p>
              <p className="text-xs text-ink-muted">
                {spaceCount} space{spaceCount === 1 ? '' : 's'} joined · {newPosts} new post{newPosts === 1 ? '' : 's'} this week
              </p>
            </div>
            <ArrowRight size={16} className="text-ink-faint" />
          </Link>
        </div>
      </section>
    </div>
  );
}
