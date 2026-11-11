import Link from 'next/link';
import { GraduationCap, Plus } from 'lucide-react';

import BecomeCoachButton from '@/components/BecomeCoachButton';
import CourseCard from '@/components/courses/CourseCard';
import PageHeader from '@/components/layout/PageHeader';
import { db } from '@/lib/db';
import { requireDbUser } from '@/lib/db/user';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Courses' };

const include = {
  coach: { select: { name: true } },
  _count: { select: { enrollments: true } },
  modules: { select: { _count: { select: { lessons: true } } } },
} as const;

const lessonCount = (c: { modules: { _count: { lessons: number } }[] }) =>
  c.modules.reduce((n, m) => n + m._count.lessons, 0);

export default async function CoursesPage() {
  const user = await requireDbUser();
  const isCoach = user.role !== 'STUDENT';

  const [enrollments, teaching, catalog] = await Promise.all([
    db.enrollment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { course: { include } },
    }),
    isCoach ? db.course.findMany({ where: { coachId: user.id }, orderBy: { updatedAt: 'desc' }, include }) : [],
    db.course.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' }, include, take: 30 }),
  ]);

  const progressRows = await db.lessonProgress.findMany({
    where: { userId: user.id },
    select: { lesson: { select: { module: { select: { courseId: true } } } } },
  });
  const doneByCourse = new Map<string, number>();
  for (const r of progressRows) {
    const id = r.lesson.module.courseId;
    doneByCourse.set(id, (doneByCourse.get(id) ?? 0) + 1);
  }

  const enrolledIds = new Set(enrollments.map((e) => e.courseId));

  return (
    <section className="flex flex-col gap-12">
      <PageHeader
        eyebrow="Grow"
        title="Courses"
        description="Structured lessons from coaches. Learn between sessions and track your progress."
        actions={
          isCoach ? (
            <Link href="/courses/new" className="btn-primary">
              <Plus size={16} /> New course
            </Link>
          ) : (
            <BecomeCoachButton label="Teach a course" />
          )
        }
      />

      {enrollments.length > 0 && (
        <div>
          <h2 className="h-display mb-4 text-xl">My learning</h2>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {enrollments.map(({ course: c }) => {
              const total = lessonCount(c);
              return (
                <CourseCard
                  key={c.id}
                  href={`/courses/${c.slug}`}
                  {...c}
                  coachName={c.coach.name}
                  lessonCount={total}
                  progress={total ? Math.round(((doneByCourse.get(c.id) ?? 0) / total) * 100) : 0}
                />
              );
            })}
          </div>
        </div>
      )}

      {isCoach && (
        <div>
          <h2 className="h-display mb-4 text-xl">Teaching</h2>
          {teaching.length === 0 ? (
            <div className="card flex flex-col items-start gap-3 p-6">
              <p className="font-semibold">You haven&apos;t created a course yet</p>
              <p className="text-sm text-ink-muted">Turn your best coaching advice into lessons students can buy any time.</p>
              <Link href="/courses/new" className="btn-primary mt-1">
                <Plus size={16} /> Create a course
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {teaching.map((c) => (
                <CourseCard
                  key={c.id}
                  href={`/courses/${c.slug}/edit`}
                  {...c}
                  lessonCount={lessonCount(c)}
                  badge={c.published ? `${c._count.enrollments} students` : 'Draft'}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="h-display mb-4 text-xl">Explore</h2>
        {catalog.length === 0 ? (
          <div className="card relative flex flex-col items-center overflow-hidden px-6 py-14 text-center">
            <div className="absolute inset-0 bg-grid opacity-60 mask-fade-b" />
            <GraduationCap size={30} className="relative text-primary" />
            <p className="h-display relative mt-4 text-xl">No courses published yet</p>
            <p className="relative mt-1 text-sm text-ink-muted">New courses from coaches will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {catalog.map((c) => (
              <CourseCard
                key={c.id}
                href={`/courses/${c.slug}`}
                {...c}
                coachName={c.coach.name}
                lessonCount={lessonCount(c)}
                badge={enrolledIds.has(c.id) ? 'Enrolled' : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
