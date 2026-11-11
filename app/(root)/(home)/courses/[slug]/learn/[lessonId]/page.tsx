import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Lock, PlayCircle } from 'lucide-react';

import CompleteButton from '@/components/courses/CompleteButton';
import EnrollButton from '@/components/courses/EnrollButton';
import LessonVideo from '@/components/courses/LessonVideo';
import Markdown from '@/components/Markdown';
import { db } from '@/lib/db';
import { requireDbUser } from '@/lib/db/user';
import { courseStats, getCourseBySlug } from '@/lib/courses';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function LessonPage({ params }: { params: { slug: string; lessonId: string } }) {
  const user = await requireDbUser();
  const course = await getCourseBySlug(params.slug);
  if (!course) notFound();
  const isOwner = course.coachId === user.id;
  if (!course.published && !isOwner) notFound();

  const { lessons, lessonCount } = courseStats(course);
  const index = lessons.findIndex((l) => l.id === params.lessonId);
  if (index === -1) notFound();
  const lesson = lessons[index];

  const [enrollment, progress] = await Promise.all([
    db.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } }),
    db.lessonProgress.findMany({
      where: { userId: user.id, lesson: { module: { courseId: course.id } } },
      select: { lessonId: true },
    }),
  ]);
  const hasAccess = !!enrollment || isOwner;
  const canView = hasAccess || lesson.isPreview;
  const completed = new Set(progress.map((p) => p.lessonId));
  const pct = lessonCount ? Math.round((completed.size / lessonCount) * 100) : 0;
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const href = (id: string) => `/courses/${course.slug}/learn/${id}`;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="flex min-w-0 flex-col gap-5">
        <Link href={`/courses/${course.slug}`} className="flex w-fit items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
          <ArrowLeft size={14} /> {course.title}
        </Link>

        {canView ? (
          <>
            {lesson.type === 'VIDEO' && lesson.videoUrl && <LessonVideo url={lesson.videoUrl} title={lesson.title} />}
            {lesson.type === 'VIDEO' && !lesson.videoUrl && (
              <div className="card flex-center aspect-video text-sm text-ink-muted">The video for this lesson is coming soon.</div>
            )}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">
                  Lesson {index + 1} of {lessonCount}
                </p>
                <h1 className="h-display mt-1 text-2xl sm:text-3xl">{lesson.title}</h1>
              </div>
              {hasAccess && <CompleteButton lessonId={lesson.id} done={completed.has(lesson.id)} />}
            </div>
            {lesson.content && (
              <div className="card p-6 sm:p-8">
                <Markdown>{lesson.content}</Markdown>
              </div>
            )}
            <div className="flex justify-between gap-3">
              {prev ? (
                <Link href={href(prev.id)} className="btn-ghost">
                  <ArrowLeft size={15} /> Previous
                </Link>
              ) : (
                <span />
              )}
              {next && (hasAccess || next.isPreview) && (
                <Link href={href(next.id)} className="btn-primary">
                  Next lesson <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="card flex flex-col items-center gap-4 p-10 text-center">
            <Lock className="text-primary" />
            <p className="h-display text-2xl">Enrol to unlock this lesson</p>
            <div className="w-full max-w-xs">
              <EnrollButton
                courseId={course.id}
                paid={course.priceCents > 0}
                label={course.priceCents ? `Buy for ${formatPrice(course.priceCents, course.currency)}` : 'Enrol for free'}
              />
            </div>
          </div>
        )}
      </div>

      <aside className="card h-fit overflow-hidden xl:sticky xl:top-24">
        <div className="border-b border-line p-5">
          <p className="font-display font-semibold">Course content</p>
          {hasAccess && (
            <>
              <div className="mt-3 h-1.5 rounded-full bg-surface-3">
                <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-ink-muted">{pct}% complete</p>
            </>
          )}
        </div>
        <div className="max-h-[70vh] overflow-y-auto">
          {course.modules.map((m, mi) => (
            <div key={m.id}>
              <p className="bg-surface-2 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                {mi + 1}. {m.title}
              </p>
              {m.lessons.map((l) => {
                const open = hasAccess || l.isPreview;
                const Icon = completed.has(l.id) ? CheckCircle2 : l.type === 'VIDEO' ? PlayCircle : FileText;
                const inner = (
                  <>
                    <Icon size={15} className={cn('shrink-0', completed.has(l.id) ? 'text-success' : 'text-ink-faint')} />
                    <span className="flex-1 truncate">{l.title}</span>
                    {!open && <Lock size={12} className="text-ink-faint" />}
                  </>
                );
                return open ? (
                  <Link
                    key={l.id}
                    href={href(l.id)}
                    className={cn(
                      'flex items-center gap-3 border-l-2 px-5 py-2.5 text-sm transition hover:bg-surface-2',
                      l.id === lesson.id ? 'border-primary bg-primary-soft text-ink' : 'border-transparent text-ink-soft'
                    )}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div key={l.id} className="flex items-center gap-3 border-l-2 border-transparent px-5 py-2.5 text-sm text-ink-faint">
                    {inner}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
