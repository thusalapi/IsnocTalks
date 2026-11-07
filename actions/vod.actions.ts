'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import { db } from '@/lib/db';
import { requireDbUser } from '@/lib/db/user';
import { detectSource } from '@/lib/vod/source';
import { shapesSchema, type Annotation } from '@/lib/vod/types';
import { toAnnotation } from '@/lib/vod/serialize';

export type ActionState = { error?: string } | undefined;

const createVodSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  game: z.string().trim().max(60).optional(),
  description: z.string().trim().max(2000).optional(),
  videoUrl: z.string().trim().url('Enter a valid video link').max(1000),
});

export async function createVod(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireDbUser();

  const parsed = createVodSchema.safeParse({
    title: formData.get('title'),
    game: formData.get('game') || undefined,
    description: formData.get('description') || undefined,
    videoUrl: formData.get('videoUrl'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const source = detectSource(parsed.data.videoUrl);
  if (!source) return { error: 'Use a YouTube link or a direct video file link (.mp4, .webm)' };

  const vod = await db.vod.create({
    data: { ...parsed.data, source, ownerId: user.id, shareId: nanoid(12) },
  });

  revalidatePath('/vods');
  redirect(`/vods/${vod.id}`);
}

async function getOwnedVod(vodId: string) {
  const user = await requireDbUser();
  const vod = await db.vod.findUnique({ where: { id: vodId } });
  if (!vod || vod.ownerId !== user.id) throw new Error('Review not found');
  return { user, vod };
}

export async function deleteVod(vodId: string) {
  await getOwnedVod(vodId);
  await db.vod.delete({ where: { id: vodId } });
  revalidatePath('/vods');
  redirect('/vods');
}

export async function setVodVisibility(vodId: string, visibility: 'PRIVATE' | 'LINK') {
  await getOwnedVod(vodId);
  const vod = await db.vod.update({ where: { id: vodId }, data: { visibility } });
  revalidatePath(`/vods/${vodId}`);
  return { visibility: vod.visibility, shareId: vod.shareId };
}

const annotationInput = z.object({
  id: z.string().optional(),
  timestamp: z.number().min(0).max(60 * 60 * 24),
  duration: z.number().min(0.5).max(60),
  note: z.string().max(4000),
  shapes: shapesSchema,
});

export async function saveAnnotation(
  vodId: string,
  input: z.input<typeof annotationInput>
): Promise<Annotation> {
  const { user } = await getOwnedVod(vodId);
  const data = annotationInput.parse(input);

  if (data.id) {
    const existing = await db.vodAnnotation.findUnique({ where: { id: data.id } });
    if (!existing || existing.vodId !== vodId) throw new Error('Note not found');
    const updated = await db.vodAnnotation.update({
      where: { id: data.id },
      data: {
        timestamp: data.timestamp,
        duration: data.duration,
        note: data.note,
        shapes: data.shapes,
      },
    });
    return toAnnotation(updated);
  }

  const created = await db.vodAnnotation.create({
    data: {
      vodId,
      authorId: user.id,
      timestamp: data.timestamp,
      duration: data.duration,
      note: data.note,
      shapes: data.shapes,
    },
  });
  await db.vod.update({ where: { id: vodId }, data: { updatedAt: new Date() } });
  return toAnnotation(created);
}

export async function deleteAnnotation(vodId: string, annotationId: string) {
  await getOwnedVod(vodId);
  await db.vodAnnotation.deleteMany({ where: { id: annotationId, vodId } });
}
