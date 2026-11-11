import 'server-only';

import { db } from '@/lib/db';

export async function getCourseBySlug(slug: string) {
  return db.course.findUnique({
    where: { slug },
    include: {
      coach: { select: { id: true, name: true, imageUrl: true } },
      modules: {
        orderBy: { position: 'asc' },
        include: { lessons: { orderBy: { position: 'asc' } } },
      },
      _count: { select: { enrollments: true } },
    },
  });
}

export type FullCourse = NonNullable<Awaited<ReturnType<typeof getCourseBySlug>>>;

export function courseStats(course: FullCourse) {
  const lessons = course.modules.flatMap((m) => m.lessons);
  const minutes = lessons.reduce((sum, l) => sum + (l.durationMin ?? 0), 0);
  return { lessons, lessonCount: lessons.length, minutes };
}

export function formatMinutes(min: number) {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m ? `${m}m` : ''}`.trim() : `${m}m`;
}
