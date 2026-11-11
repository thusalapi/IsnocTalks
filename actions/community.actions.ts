'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { db } from '@/lib/db';
import { requireDbUser } from '@/lib/db/user';
import { slugify } from '@/lib/format';
import { canJoinSpace } from '@/lib/community';

export type FormState = { error?: string; ok?: boolean } | undefined;

const SPACE_COLORS = ['#8B5CF6', '#22D3EE', '#F472B6', '#FBBF24', '#34D399', '#F43F5E'];

/* ---------- Access helpers ---------- */

async function getMembership(spaceId: string, userId: string) {
  return db.spaceMember.findUnique({ where: { spaceId_userId: { spaceId, userId } } });
}

async function isModerator(spaceId: string, userId: string) {
  const space = await db.space.findUnique({ where: { id: spaceId }, select: { ownerId: true, slug: true } });
  if (!space) return { allowed: false, slug: '' };
  if (space.ownerId === userId) return { allowed: true, slug: space.slug };
  const m = await getMembership(spaceId, userId);
  return { allowed: m?.role === 'MODERATOR', slug: space.slug };
}

/* ---------- Spaces ---------- */

const spaceSchema = z.object({
  name: z.string().trim().min(2, 'Name the space').max(60),
  description: z.string().trim().max(500).optional(),
  game: z.string().trim().max(60).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  courseId: z.string().optional(),
});

export async function createSpace(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireDbUser();
  if (user.role === 'STUDENT') return { error: 'Only coaches can create spaces' };

  const parsed = spaceSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    game: formData.get('game') || undefined,
    color: formData.get('color') || undefined,
    courseId: formData.get('courseId') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  if (parsed.data.courseId) {
    const course = await db.course.findUnique({ where: { id: parsed.data.courseId } });
    if (!course || course.coachId !== user.id) return { error: 'Pick one of your own courses' };
  }

  const space = await db.space.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? '',
      game: parsed.data.game,
      color: parsed.data.color ?? SPACE_COLORS[Math.floor(Math.random() * SPACE_COLORS.length)],
      slug: slugify(parsed.data.name),
      ownerId: user.id,
      access: parsed.data.courseId ? 'COURSE' : 'OPEN',
      courseId: parsed.data.courseId,
      members: { create: { userId: user.id, role: 'MODERATOR' } },
    },
  });
  revalidatePath('/community');
  redirect(`/community/${space.slug}`);
}

export async function joinSpace(spaceId: string) {
  const user = await requireDbUser();
  const space = await db.space.findUnique({ where: { id: spaceId } });
  if (!space) throw new Error('Space not found');
  if (!(await canJoinSpace(user.id, space))) throw new Error('This space is for students of its course');
  await db.spaceMember.upsert({
    where: { spaceId_userId: { spaceId, userId: user.id } },
    update: {},
    create: { spaceId, userId: user.id },
  });
  revalidatePath('/community');
  revalidatePath(`/community/${space.slug}`);
}

export async function leaveSpace(spaceId: string) {
  const user = await requireDbUser();
  const space = await db.space.findUnique({ where: { id: spaceId } });
  if (!space) return;
  if (space.ownerId === user.id) throw new Error('Owners cannot leave their own space');
  await db.spaceMember.deleteMany({ where: { spaceId, userId: user.id } });
  revalidatePath('/community');
  revalidatePath(`/community/${space.slug}`);
}

export async function deleteSpace(spaceId: string) {
  const user = await requireDbUser();
  const space = await db.space.findUnique({ where: { id: spaceId } });
  if (!space || (space.ownerId !== user.id && user.role !== 'ADMIN')) throw new Error('Not allowed');
  await db.space.delete({ where: { id: spaceId } });
  revalidatePath('/community');
  redirect('/community');
}

/* ---------- Posts ---------- */

const postSchema = z.object({
  title: z.string().trim().max(140).optional(),
  body: z.string().trim().min(1, 'Write something first').max(5000),
  clipUrl: z.union([z.string().trim().url('Clip must be a link'), z.literal('')]).optional(),
});

export async function createPost(spaceId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireDbUser();
  const member = await getMembership(spaceId, user.id);
  if (!member) return { error: 'Join the space to post' };

  const parsed = postSchema.safeParse({
    title: formData.get('title') || undefined,
    body: formData.get('body'),
    clipUrl: formData.get('clipUrl') ?? '',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const space = await db.space.findUnique({ where: { id: spaceId }, select: { slug: true } });
  await db.post.create({
    data: {
      spaceId,
      authorId: user.id,
      title: parsed.data.title,
      body: parsed.data.body,
      clipUrl: parsed.data.clipUrl || null,
    },
  });
  revalidatePath(`/community/${space?.slug}`);
  revalidatePath('/community');
  return { ok: true };
}

async function getPostForEdit(postId: string) {
  const user = await requireDbUser();
  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error('Post not found');
  const mod = await isModerator(post.spaceId, user.id);
  return { user, post, isMod: mod.allowed, slug: mod.slug };
}

export async function deletePost(postId: string) {
  const { user, post, isMod, slug } = await getPostForEdit(postId);
  if (post.authorId !== user.id && !isMod) throw new Error('Not allowed');
  await db.post.delete({ where: { id: postId } });
  revalidatePath(`/community/${slug}`);
}

export async function togglePin(postId: string) {
  const { post, isMod, slug } = await getPostForEdit(postId);
  if (!isMod) throw new Error('Only moderators can pin posts');
  await db.post.update({ where: { id: postId }, data: { pinned: !post.pinned } });
  revalidatePath(`/community/${slug}`);
}

export async function toggleLike(postId: string) {
  const user = await requireDbUser();
  const key = { postId_userId: { postId, userId: user.id } };
  const liked = await db.postLike.findUnique({ where: key });
  if (liked) await db.postLike.delete({ where: key });
  else await db.postLike.create({ data: { postId, userId: user.id } });
  const count = await db.postLike.count({ where: { postId } });
  return { liked: !liked, count };
}

/* ---------- Comments ---------- */

export async function addComment(postId: string, body: string) {
  const user = await requireDbUser();
  const text = body.trim().slice(0, 2000);
  if (!text) throw new Error('Write a comment first');
  const post = await db.post.findUnique({ where: { id: postId }, include: { space: true } });
  if (!post) throw new Error('Post not found');
  const member = await getMembership(post.spaceId, user.id);
  if (!member) throw new Error('Join the space to comment');
  await db.comment.create({ data: { postId, authorId: user.id, body: text } });
  revalidatePath(`/community/${post.space.slug}/${postId}`);
  revalidatePath(`/community/${post.space.slug}`);
}

export async function deleteComment(commentId: string) {
  const user = await requireDbUser();
  const comment = await db.comment.findUnique({ where: { id: commentId }, include: { post: { include: { space: true } } } });
  if (!comment) return;
  const mod = await isModerator(comment.post.spaceId, user.id);
  if (comment.authorId !== user.id && !mod.allowed) throw new Error('Not allowed');
  await db.comment.delete({ where: { id: commentId } });
  revalidatePath(`/community/${comment.post.space.slug}/${comment.postId}`);
}
