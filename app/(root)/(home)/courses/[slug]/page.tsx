import { notFound } from 'next/navigation';

import CourseOverview from '@/components/courses/CourseOverview';
import { db } from '@/lib/db';
import { requireDbUser } from '@/lib/db/user';
import { getCourseBySlug } from '@/lib/courses';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const course = await db.course.findUnique({ where: { slug: params.slug }, select: { title: true } });
  return { title: course?.title ?? 'Course' };
}

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { purchased?: string };
}) {
  const user = await requireDbUser();
  const course = await getCourseBySlug(params.slug);
  const isOwner = course?.coachId === user.id;
  if (!course || (!course.published && !isOwner)) notFound();

  const [enrollment, progress] = await Promise.all([
    db.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } }),
    db.lessonProgress.findMany({
      where: { userId: user.id, lesson: { module: { courseId: course.id } } },
      select: { lessonId: true },
    }),
  ]);

  return (
    <CourseOverview
      course={course}
      mode="app"
      enrolled={!!enrollment}
      isOwner={isOwner}
      completedIds={new Set(progress.map((p) => p.lessonId))}
      purchased={searchParams.purchased === '1'}
    />
  );
}
