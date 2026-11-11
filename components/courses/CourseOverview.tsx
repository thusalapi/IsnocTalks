/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { BarChart3, BookOpen, CheckCircle2, Clock, Lock, PlayCircle, FileText, Users } from 'lucide-react';

import Markdown from '@/components/Markdown';
import UserAvatar from '@/components/UserAvatar';
import { courseStats, formatMinutes, type FullCourse } from '@/lib/courses';
import { LEVEL_LABEL, formatPrice } from '@/lib/format';
import EnrollButton from './EnrollButton';

type Props = {
  course: FullCourse;
  /** in-app: signed-in view with enroll actions. public: marketing view with sign-up links. */
  mode: 'app' | 'public';
  enrolled?: boolean;
  isOwner?: boolean;
  completedIds?: Set<string>;
  purchased?: boolean;
};

export default function CourseOverview({ course, mode, enrolled, isOwner, completedIds, purchased }: Props) {
  const { lessons, lessonCount, minutes } = courseStats(course);
  const hasAccess = enrolled || isOwner;
  const lessonHref = (id: string) => `/courses/${course.slug}/learn/${id}`;
  const nextLesson = lessons.find((l) => !completedIds?.has(l.id)) ?? lessons[0];
  const done = completedIds ? lessons.filter((l) => completedIds.has(l.id)).length : 0;
  const pct = lessonCount ? Math.round((done / lessonCount) * 100) : 0;
  const paid = course.priceCents > 0;

  const cta =
    mode === 'public' ? (
      <Link href={`/sign-up?redirect_url=/courses/${course.slug}`} className="btn-primary w-full py-3 text-base">
        {paid ? `Get the course · ${formatPrice(course.priceCents, course.currency)}` : 'Start learning for free'}
      </Link>
    ) : hasAccess && nextLesson ? (
      <Link href={lessonHref(nextLesson.id)} className="btn-primary w-full py-3 text-base">
        {done ? 'Continue learning' : 'Start course'}
      </Link>
    ) : (
      <EnrollButton
        courseId={course.id}
        paid={paid}
        label={paid ? `Buy for ${formatPrice(course.priceCents, course.currency)}` : 'Enrol for free'}
      />
    );

  return (
    <div className="flex flex-col gap-8">
      {purchased && !enrolled && (
        <div className="card border-success/40 bg-success/10 p-4 text-sm text-success">
          Thanks for your purchase. Your access is being confirmed and will appear here in a few seconds. Refresh if it
          doesn&apos;t.
        </div>
      )}

      {/* Hero */}
      <section className="card relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50 mask-fade-b" />
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap gap-2">
              {course.game && <span className="chip">{course.game}</span>}
              <span className="chip border-accent/30 text-accent">
                <BarChart3 size={12} /> {LEVEL_LABEL[course.level]}
              </span>
              {!course.published && <span className="chip border-warn/40 text-warn">Draft</span>}
            </div>
            <h1 className="h-display mt-4 text-3xl sm:text-5xl">{course.title}</h1>
            {course.subtitle && <p className="mt-3 text-lg text-ink-muted">{course.subtitle}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-soft">
              <span className="flex items-center gap-2">
                <UserAvatar name={course.coach.name} imageUrl={course.coach.imageUrl} className="size-7" />
                Coach {course.coach.name ?? 'IsnocTalks'}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen size={15} className="text-primary" /> {lessonCount} lessons
              </span>
              {formatMinutes(minutes) && (
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-primary" /> {formatMinutes(minutes)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users size={15} className="text-primary" /> {course._count.enrollments} enrolled
              </span>
            </div>
          </div>

          <div className="glassmorphism flex flex-col gap-4 rounded-2xl border border-line p-5">
            {course.coverUrl ? (
              <img src={course.coverUrl} alt="" className="aspect-video w-full rounded-xl object-cover" />
            ) : null}
            <p className="font-display text-3xl font-bold">{formatPrice(course.priceCents, course.currency)}</p>
            {hasAccess && mode === 'app' && lessonCount > 0 && (
              <div>
                <div className="h-2 rounded-full bg-surface-3">
                  <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-ink-muted">
                  {done} of {lessonCount} lessons complete
                </p>
              </div>
            )}
            {cta}
            {isOwner && mode === 'app' && (
              <Link href={`/courses/${course.slug}/edit`} className="btn-ghost w-full">
                Edit course
              </Link>
            )}
            <ul className="flex flex-col gap-2 text-sm text-ink-muted">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-success" /> Lifetime access
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-success" /> Learn at your own pace
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-success" /> Track your progress
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* About */}
        <section className="card p-6 sm:p-8">
          <h2 className="h-display text-2xl">About this course</h2>
          {course.description ? (
            <Markdown className="mt-4">{course.description}</Markdown>
          ) : (
            <p className="mt-3 text-ink-muted">The coach hasn&apos;t written a description yet.</p>
          )}
        </section>

        {/* Curriculum */}
        <section className="card h-fit overflow-hidden">
          <div className="border-b border-line p-5">
            <h2 className="h-display text-xl">Curriculum</h2>
            <p className="text-sm text-ink-muted">
              {course.modules.length} modules · {lessonCount} lessons
            </p>
          </div>
          <div className="flex flex-col">
            {course.modules.map((m, mi) => (
              <div key={m.id} className="border-b border-line last:border-none">
                <p className="bg-surface-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  {mi + 1}. {m.title}
                </p>
                <ul>
                  {m.lessons.map((l) => {
                    const open = mode === 'app' && (hasAccess || l.isPreview);
                    const Icon = l.type === 'VIDEO' ? PlayCircle : FileText;
                    const row = (
                      <>
                        {completedIds?.has(l.id) ? (
                          <CheckCircle2 size={16} className="shrink-0 text-success" />
                        ) : (
                          <Icon size={16} className="shrink-0 text-ink-faint" />
                        )}
                        <span className="flex-1 truncate">{l.title}</span>
                        {l.isPreview && !hasAccess && <span className="chip py-0.5 text-[10px] text-accent">Preview</span>}
                        {l.durationMin ? <span className="text-xs text-ink-faint">{l.durationMin}m</span> : null}
                        {!open && !l.isPreview && <Lock size={13} className="text-ink-faint" />}
                      </>
                    );
                    return (
                      <li key={l.id}>
                        {open ? (
                          <Link href={lessonHref(l.id)} className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-surface-2">
                            {row}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 px-5 py-3 text-sm text-ink-soft">{row}</div>
                        )}
                      </li>
                    );
                  })}
                  {m.lessons.length === 0 && <li className="px-5 py-3 text-sm text-ink-faint">No lessons yet</li>}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
