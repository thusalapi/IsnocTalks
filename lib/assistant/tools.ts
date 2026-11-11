import 'server-only';

import { tool } from 'ai';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import { canJoinSpace } from '@/lib/community';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/format';
import { detectSource, formatTime } from '@/lib/vod/source';

type Viewer = { id: string; role: 'STUDENT' | 'COACH' | 'ADMIN'; name: string | null };

/**
 * Tools for the in-app assistant. Every tool runs as the signed-in user, so the
 * assistant can never read or change more than that person could by clicking.
 */
export function buildAssistantTools(user: Viewer) {
  return {
    searchCourses: tool({
      description:
        'Search published courses. Use for any question about what courses exist, prices, or recommendations.',
      inputSchema: z.object({
        query: z.string().max(80).optional().describe('Words to match in the title, subtitle or description'),
        game: z.string().max(60).optional().describe('Game name, e.g. Valorant'),
        level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
        freeOnly: z.boolean().optional(),
      }),
      execute: async ({ query, game, level, freeOnly }) => {
        const courses = await db.course.findMany({
          where: {
            published: true,
            ...(game ? { game: { contains: game, mode: 'insensitive' as const } } : {}),
            ...(level ? { level } : {}),
            ...(freeOnly ? { priceCents: 0 } : {}),
            ...(query
              ? {
                  OR: [
                    { title: { contains: query, mode: 'insensitive' as const } },
                    { subtitle: { contains: query, mode: 'insensitive' as const } },
                    { description: { contains: query, mode: 'insensitive' as const } },
                  ],
                }
              : {}),
          },
          orderBy: { createdAt: 'desc' },
          take: 8,
          include: {
            coach: { select: { name: true } },
            modules: { select: { _count: { select: { lessons: true } } } },
            _count: { select: { enrollments: true } },
          },
        });
        return courses.map((c) => ({
          title: c.title,
          subtitle: c.subtitle,
          game: c.game,
          level: c.level,
          price: formatPrice(c.priceCents, c.currency),
          coach: c.coach.name,
          lessons: c.modules.reduce((n, m) => n + m._count.lessons, 0),
          students: c._count.enrollments,
          href: `/courses/${c.slug}`,
          slug: c.slug,
        }));
      },
    }),

    getCourseOutline: tool({
      description: 'Get the modules and lesson titles of one course, by slug.',
      inputSchema: z.object({ slug: z.string().max(80) }),
      execute: async ({ slug }) => {
        const c = await db.course.findUnique({
          where: { slug },
          include: {
            coach: { select: { name: true } },
            modules: {
              orderBy: { position: 'asc' },
              include: { lessons: { orderBy: { position: 'asc' }, select: { title: true, type: true, durationMin: true, isPreview: true } } },
            },
          },
        });
        if (!c || (!c.published && c.coachId !== user.id)) return { error: 'Course not found' };
        return {
          title: c.title,
          description: c.description.slice(0, 1200),
          coach: c.coach.name,
          price: formatPrice(c.priceCents, c.currency),
          href: `/courses/${c.slug}`,
          modules: c.modules.map((m) => ({ title: m.title, lessons: m.lessons })),
        };
      },
    }),

    getMyLearning: tool({
      description: "List the courses the user is enrolled in, with progress and a link to continue.",
      inputSchema: z.object({}),
      execute: async () => {
        const enrollments = await db.enrollment.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          include: {
            course: {
              include: {
                modules: { orderBy: { position: 'asc' }, include: { lessons: { orderBy: { position: 'asc' }, select: { id: true, title: true } } } },
              },
            },
          },
        });
        const done = new Set(
          (await db.lessonProgress.findMany({ where: { userId: user.id }, select: { lessonId: true } })).map((p) => p.lessonId)
        );
        return enrollments.map((e) => {
          const lessons = e.course.modules.flatMap((m) => m.lessons);
          const next = lessons.find((l) => !done.has(l.id));
          const completed = lessons.filter((l) => done.has(l.id)).length;
          return {
            title: e.course.title,
            completed,
            total: lessons.length,
            nextLesson: next?.title ?? null,
            href: next ? `/courses/${e.course.slug}/learn/${next.id}` : `/courses/${e.course.slug}`,
          };
        });
      },
    }),

    listMyReviews: tool({
      description: "List the user's VOD reviews (gameplay breakdowns with timestamped notes).",
      inputSchema: z.object({}),
      execute: async () => {
        const vods = await db.vod.findMany({
          where: { ownerId: user.id },
          orderBy: { updatedAt: 'desc' },
          take: 15,
          include: { _count: { select: { annotations: true } } },
        });
        return vods.map((v) => ({ id: v.id, title: v.title, game: v.game, notes: v._count.annotations, href: `/vods/${v.id}` }));
      },
    }),

    getReviewNotes: tool({
      description: 'Read the timestamped coach notes on one VOD review. Use to summarise or explain feedback.',
      inputSchema: z.object({ vodId: z.string().max(40) }),
      execute: async ({ vodId }) => {
        const vod = await db.vod.findUnique({
          where: { id: vodId },
          include: { annotations: { orderBy: { timestamp: 'asc' }, select: { timestamp: true, note: true, shapes: true } } },
        });
        if (!vod || (vod.ownerId !== user.id && vod.visibility !== 'LINK')) return { error: 'Review not found' };
        return {
          title: vod.title,
          game: vod.game,
          context: vod.description,
          href: `/vods/${vod.id}`,
          notes: vod.annotations.map((a) => ({
            at: formatTime(a.timestamp),
            note: a.note || '(drawing only)',
            hasDrawing: Array.isArray(a.shapes) && a.shapes.length > 0,
          })),
        };
      },
    }),

    listSpaces: tool({
      description: 'List community spaces and whether the user has joined each one.',
      inputSchema: z.object({ game: z.string().max(60).optional() }),
      execute: async ({ game }) => {
        const spaces = await db.space.findMany({
          where: game ? { game: { contains: game, mode: 'insensitive' as const } } : {},
          orderBy: { createdAt: 'asc' },
          take: 20,
          include: {
            _count: { select: { members: true, posts: true } },
            members: { where: { userId: user.id }, select: { userId: true } },
            course: { select: { title: true } },
          },
        });
        return spaces.map((s) => ({
          name: s.name,
          game: s.game,
          description: s.description.slice(0, 200),
          members: s._count.members,
          posts: s._count.posts,
          joined: s.members.length > 0,
          membersOnlyCourse: s.access === 'COURSE' ? s.course?.title ?? 'a course' : null,
          href: `/community/${s.slug}`,
          slug: s.slug,
        }));
      },
    }),

    /* ---------- Actions that change data. These need the user to confirm in the chat. ---------- */

    enrollInFreeCourse: tool({
      description: 'Enrol the user in a FREE course. Never use for paid courses. Send those users to the course page instead.',
      inputSchema: z.object({ slug: z.string().max(80) }),
      execute: async ({ slug }) => {
        const course = await db.course.findUnique({ where: { slug } });
        if (!course || !course.published) return { error: 'Course not found' };
        if (course.priceCents > 0) return { error: 'This course is paid. Open the course page to buy it.', href: `/courses/${slug}` };
        await db.enrollment.upsert({
          where: { userId_courseId: { userId: user.id, courseId: course.id } },
          update: {},
          create: { userId: user.id, courseId: course.id, source: 'FREE' },
        });
        revalidatePath('/courses');
        revalidatePath(`/courses/${slug}`, 'layout');
        return { ok: true, title: course.title, href: `/courses/${slug}` };
      },
    }),

    createVodReview: tool({
      description: 'Create a new VOD review from a YouTube or direct video link, so the user can draw and add notes on it.',
      inputSchema: z.object({
        title: z.string().min(1).max(120),
        videoUrl: z.string().url().max(1000),
        game: z.string().max(60).optional(),
      }),
      execute: async ({ title, videoUrl, game }) => {
        const source = detectSource(videoUrl);
        if (!source) return { error: 'Use a YouTube link or a direct .mp4/.webm link.' };
        const vod = await db.vod.create({ data: { title, videoUrl, game, source, ownerId: user.id, shareId: nanoid(12) } });
        revalidatePath('/vods');
        return { ok: true, title: vod.title, href: `/vods/${vod.id}` };
      },
    }),

    joinSpace: tool({
      description: 'Join a community space on behalf of the user.',
      inputSchema: z.object({ slug: z.string().max(80) }),
      execute: async ({ slug }) => {
        const space = await db.space.findUnique({ where: { slug } });
        if (!space) return { error: 'Space not found' };
        if (!(await canJoinSpace(user.id, space))) return { error: 'This space is only for students of its course.' };
        await db.spaceMember.upsert({
          where: { spaceId_userId: { spaceId: space.id, userId: user.id } },
          update: {},
          create: { spaceId: space.id, userId: user.id },
        });
        revalidatePath('/community');
        revalidatePath(`/community/${slug}`);
        return { ok: true, name: space.name, href: `/community/${slug}` };
      },
    }),
  };
}

/** Tools the user must approve in the chat before they run. */
export const APPROVAL_TOOLS = ['enrollInFreeCourse', 'createVodReview', 'joinSpace'] as const;

export function buildInstructions(user: Viewer) {
  return `You are the IsnocTalks assistant, a helper inside a coaching platform for competitive gamers.
The signed-in user is ${user.name ?? 'a player'} (role: ${user.role.toLowerCase()}).

What you do:
- Help the user find courses, continue their learning, understand coach feedback on their VOD reviews, and find community spaces.
- Use the tools to look things up. Never invent courses, notes, prices or links. If a tool returns nothing, say so.
- When you mention a course, review or space, link it with the "href" the tool returned, as a Markdown link.
- For actions (enrolling, creating a review, joining a space), call the tool directly. The app asks the user to confirm before it runs, so do not ask for confirmation yourself in text.
- If the user declines an action, accept it and move on.
- You may draft community posts or practice plans as text. You cannot post for the user.
- You can give general coaching advice for competitive games, grounded in the user's review notes when they exist.

Style: short and plain. Use bullet lists for several items. No filler.
Stay on IsnocTalks and gaming improvement. Politely decline anything else.`;
}
