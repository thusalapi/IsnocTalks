'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';

import { db } from '@/lib/db';
import { requireDbUser } from '@/lib/db/user';
import { slugify } from '@/lib/format';
import { createCourseCheckout, isLemonConfigured } from '@/lib/payments/lemonsqueezy';
import { getBaseUrl } from '@/lib/url';

export type FormState = { error?: string; ok?: boolean } | undefined;

/* ---------- Roles ---------- */

export async function becomeCoach() {
  const user = await requireDbUser();
  if (user.role === 'STUDENT') await db.user.update({ where: { id: user.id }, data: { role: 'COACH' } });
  revalidatePath('/', 'layout');
}

async function requireCoach() {
  const user = await requireDbUser();
  if (user.role === 'STUDENT') throw new Error('Only coaches can do this');
  return user;
}

async function getOwnedCourse(courseId: string) {
  const user = await requireDbUser();
  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course || (course.coachId !== user.id && user.role !== 'ADMIN')) throw new Error('Course not found');
  return { user, course };
}

function refreshCourse(slug: string) {
  revalidatePath('/courses');
  revalidatePath(`/courses/${slug}`, 'layout');
  revalidatePath(`/c/${slug}`);
}

/* ---------- Course details ---------- */

const detailsSchema = z.object({
  title: z.string().trim().min(3, 'Give the course a title').max(120),
  subtitle: z.string().trim().max(200).optional(),
  description: z.string().trim().max(10000).optional(),
  game: z.string().trim().max(60).optional(),
  coverUrl: z.union([z.string().trim().url('Cover must be an image link'), z.literal('')]).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  price: z.coerce.number().min(0).max(10000).default(0),
  lemonVariantId: z.string().trim().max(40).optional(),
});

function readDetails(formData: FormData) {
  const get = (k: string) => {
    const v = formData.get(k);
    return v === null ? undefined : String(v);
  };
  return detailsSchema.safeParse({
    title: get('title'),
    subtitle: get('subtitle') || undefined,
    description: get('description') || undefined,
    game: get('game') || undefined,
    coverUrl: get('coverUrl') ?? '',
    level: get('level') || 'BEGINNER',
    price: get('price') || 0,
    lemonVariantId: get('lemonVariantId') || undefined,
  });
}

export async function createCourse(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCoach();
  const parsed = readDetails(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { price, coverUrl, ...rest } = parsed.data;

  const course = await db.course.create({
    data: {
      ...rest,
      coverUrl: coverUrl || null,
      priceCents: Math.round(price * 100),
      slug: slugify(rest.title),
      coachId: user.id,
      modules: {
        create: {
          title: 'Getting started',
          position: 0,
          lessons: { create: { title: 'Welcome to the course', position: 0, type: 'TEXT', isPreview: true } },
        },
      },
    },
  });
  revalidatePath('/courses');
  redirect(`/courses/${course.slug}/edit`);
}

export async function updateCourseDetails(courseId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const { course } = await getOwnedCourse(courseId);
  const parsed = readDetails(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { price, coverUrl, ...rest } = parsed.data;
  await db.course.update({
    where: { id: courseId },
    data: {
      ...rest,
      subtitle: rest.subtitle ?? null,
      game: rest.game ?? null,
      description: rest.description ?? '',
      lemonVariantId: rest.lemonVariantId ?? null,
      coverUrl: coverUrl || null,
      priceCents: Math.round(price * 100),
    },
  });
  refreshCourse(course.slug);
  return { ok: true };
}

export async function setCoursePublished(courseId: string, published: boolean) {
  const { course } = await getOwnedCourse(courseId);
  if (published) {
    const lessons = await db.lesson.count({ where: { module: { courseId } } });
    if (lessons === 0) throw new Error('Add at least one lesson before publishing');
  }
  await db.course.update({ where: { id: courseId }, data: { published } });
  refreshCourse(course.slug);
}

export async function deleteCourse(courseId: string) {
  await getOwnedCourse(courseId);
  await db.course.delete({ where: { id: courseId } });
  revalidatePath('/courses');
  redirect('/courses');
}

/* ---------- Modules ---------- */

export async function addModule(courseId: string, title: string) {
  const { course } = await getOwnedCourse(courseId);
  const count = await db.courseModule.count({ where: { courseId } });
  await db.courseModule.create({
    data: { courseId, title: title.trim().slice(0, 120) || `Module ${count + 1}`, position: count },
  });
  refreshCourse(course.slug);
}

async function getOwnedModule(moduleId: string) {
  const mod = await db.courseModule.findUnique({ where: { id: moduleId } });
  if (!mod) throw new Error('Module not found');
  const { course } = await getOwnedCourse(mod.courseId);
  return { mod, course };
}

export async function renameModule(moduleId: string, title: string) {
  const { course } = await getOwnedModule(moduleId);
  await db.courseModule.update({ where: { id: moduleId }, data: { title: title.trim().slice(0, 120) || 'Untitled module' } });
  refreshCourse(course.slug);
}

export async function deleteModule(moduleId: string) {
  const { course } = await getOwnedModule(moduleId);
  await db.courseModule.delete({ where: { id: moduleId } });
  refreshCourse(course.slug);
}

export async function moveModule(moduleId: string, dir: -1 | 1) {
  const { mod, course } = await getOwnedModule(moduleId);
  const list = await db.courseModule.findMany({ where: { courseId: mod.courseId }, orderBy: { position: 'asc' } });
  const i = list.findIndex((m) => m.id === moduleId);
  const j = i + dir;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await db.$transaction(list.map((m, idx) => db.courseModule.update({ where: { id: m.id }, data: { position: idx } })));
  refreshCourse(course.slug);
}

/* ---------- Lessons ---------- */

export async function addLesson(moduleId: string, title: string) {
  const { course } = await getOwnedModule(moduleId);
  const count = await db.lesson.count({ where: { moduleId } });
  await db.lesson.create({
    data: { moduleId, title: title.trim().slice(0, 120) || `Lesson ${count + 1}`, position: count },
  });
  refreshCourse(course.slug);
}

async function getOwnedLesson(lessonId: string) {
  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, include: { module: true } });
  if (!lesson) throw new Error('Lesson not found');
  const { course } = await getOwnedCourse(lesson.module.courseId);
  return { lesson, course };
}

const lessonSchema = z.object({
  title: z.string().trim().min(1).max(120),
  type: z.enum(['VIDEO', 'TEXT']),
  videoUrl: z.union([z.string().trim().url(), z.literal('')]).optional(),
  content: z.string().max(50000).default(''),
  durationMin: z.coerce.number().int().min(0).max(1000).optional(),
  isPreview: z.boolean().default(false),
});

export async function updateLesson(lessonId: string, input: z.input<typeof lessonSchema>) {
  const { course } = await getOwnedLesson(lessonId);
  const data = lessonSchema.parse(input);
  await db.lesson.update({
    where: { id: lessonId },
    data: { ...data, videoUrl: data.videoUrl || null, durationMin: data.durationMin || null },
  });
  refreshCourse(course.slug);
}

export async function deleteLesson(lessonId: string) {
  const { course } = await getOwnedLesson(lessonId);
  await db.lesson.delete({ where: { id: lessonId } });
  refreshCourse(course.slug);
}

export async function moveLesson(lessonId: string, dir: -1 | 1) {
  const { lesson, course } = await getOwnedLesson(lessonId);
  const list = await db.lesson.findMany({ where: { moduleId: lesson.moduleId }, orderBy: { position: 'asc' } });
  const i = list.findIndex((l) => l.id === lessonId);
  const j = i + dir;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await db.$transaction(list.map((l, idx) => db.lesson.update({ where: { id: l.id }, data: { position: idx } })));
  refreshCourse(course.slug);
}

/* ---------- Students ---------- */

async function firstLessonId(courseId: string) {
  const lesson = await db.lesson.findFirst({
    where: { module: { courseId } },
    orderBy: [{ module: { position: 'asc' } }, { position: 'asc' }],
    select: { id: true },
  });
  return lesson?.id;
}

/** Enrols in a free course, or returns a checkout URL for a paid one. */
export async function enroll(courseId: string): Promise<{ redirectTo?: string; error?: string }> {
  const user = await requireDbUser();
  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course || (!course.published && course.coachId !== user.id)) return { error: 'Course not found' };

  const existing = await db.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId } } });
  const lessonId = await firstLessonId(courseId);
  const learnUrl = lessonId ? `/courses/${course.slug}/learn/${lessonId}` : `/courses/${course.slug}`;

  if (existing || course.coachId === user.id) return { redirectTo: learnUrl };

  if (course.priceCents === 0) {
    await db.enrollment.create({ data: { userId: user.id, courseId, source: 'FREE' } });
    revalidatePath(`/courses/${course.slug}`, 'layout');
    return { redirectTo: learnUrl };
  }

  if (!isLemonConfigured() || !course.lemonVariantId) {
    return { error: 'Checkout for this course is not set up yet. Please check back soon.' };
  }

  const clerk = await currentUser();
  const url = await createCourseCheckout({
    variantId: course.lemonVariantId,
    userId: user.id,
    courseId,
    email: clerk?.emailAddresses[0]?.emailAddress,
    name: user.name ?? undefined,
    redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL || getBaseUrl()}/courses/${course.slug}?purchased=1`,
  });
  return { redirectTo: url };
}

export async function toggleLessonComplete(lessonId: string) {
  const user = await requireDbUser();
  const key = { userId_lessonId: { userId: user.id, lessonId } };
  const done = await db.lessonProgress.findUnique({ where: key });
  if (done) await db.lessonProgress.delete({ where: key });
  else await db.lessonProgress.create({ data: { userId: user.id, lessonId } });
  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, include: { module: { include: { course: true } } } });
  if (lesson) revalidatePath(`/courses/${lesson.module.course.slug}`, 'layout');
  return !done;
}
