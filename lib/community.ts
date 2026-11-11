import 'server-only';

import { db } from '@/lib/db';

export async function canJoinSpace(
  userId: string,
  space: { ownerId: string; access: 'OPEN' | 'COURSE'; courseId: string | null }
) {
  if (space.access === 'OPEN' || space.ownerId === userId) return true;
  if (!space.courseId) return false;
  const enrolled = await db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId: space.courseId } } });
  return !!enrolled;
}

export const postInclude = (userId: string) =>
  ({
    author: { select: { id: true, name: true, imageUrl: true, role: true } },
    _count: { select: { comments: true, likes: true } },
    likes: { where: { userId }, select: { userId: true } },
  }) as const;
