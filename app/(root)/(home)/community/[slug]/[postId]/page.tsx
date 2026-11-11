import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import CommentSection from '@/components/community/CommentSection';
import PostCard from '@/components/community/PostCard';
import { db } from '@/lib/db';
import { requireDbUser } from '@/lib/db/user';
import { canJoinSpace, postInclude } from '@/lib/community';
import { timeAgo } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function PostPage({ params }: { params: { slug: string; postId: string } }) {
  const user = await requireDbUser();
  const post = await db.post.findUnique({
    where: { id: params.postId },
    include: {
      ...postInclude(user.id),
      space: true,
      comments: { orderBy: { createdAt: 'asc' }, include: { author: { select: { id: true, name: true, imageUrl: true } } } },
    },
  });
  if (!post || post.space.slug !== params.slug) notFound();

  const membership = await db.spaceMember.findUnique({ where: { spaceId_userId: { spaceId: post.spaceId, userId: user.id } } });
  if (post.space.access === 'COURSE' && !membership && !(await canJoinSpace(user.id, post.space))) notFound();
  const isMod = post.space.ownerId === user.id || membership?.role === 'MODERATOR';

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-5">
      <Link href={`/community/${post.space.slug}`} className="flex w-fit items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={14} /> {post.space.name}
      </Link>
      <PostCard post={post} spaceSlug={post.space.slug} viewerId={user.id} isMod={isMod} full />
      <CommentSection
        postId={post.id}
        viewer={{ id: user.id, name: user.name, imageUrl: user.imageUrl }}
        isMod={isMod}
        canComment={!!membership}
        comments={post.comments.map((c) => ({
          id: c.id,
          body: c.body,
          createdLabel: timeAgo(c.createdAt),
          author: c.author,
        }))}
      />
    </section>
  );
}
