import Link from 'next/link';
import { Pin } from 'lucide-react';

import UserAvatar from '@/components/UserAvatar';
import { timeAgo } from '@/lib/format';
import ClipPreview from './ClipPreview';
import PostActions from './PostActions';

export type FeedPost = {
  id: string;
  title: string | null;
  body: string;
  clipUrl: string | null;
  pinned: boolean;
  createdAt: Date;
  author: { id: string; name: string | null; imageUrl: string | null; role: string };
  _count: { comments: number; likes: number };
  likes: { userId: string }[];
};

export default function PostCard({
  post,
  spaceSlug,
  viewerId,
  isMod,
  full,
  spaceName,
}: {
  post: FeedPost;
  spaceSlug: string;
  viewerId: string;
  isMod: boolean;
  full?: boolean;
  spaceName?: string;
}) {
  const href = `/community/${spaceSlug}/${post.id}`;
  return (
    <article className={`card flex flex-col gap-4 p-5 ${post.pinned ? 'border-warn/40' : ''}`}>
      <header className="flex items-center gap-3">
        <UserAvatar name={post.author.name} imageUrl={post.author.imageUrl} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            {post.author.name ?? 'Player'}
            {post.author.role !== 'STUDENT' && (
              <span className="rounded-md border border-primary/40 bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                Coach
              </span>
            )}
          </p>
          <p className="text-xs text-ink-faint">
            {spaceName ? (
              <>
                in{' '}
                <Link href={`/community/${spaceSlug}`} className="text-ink-muted hover:text-ink">
                  {spaceName}
                </Link>{' '}
                ·{' '}
              </>
            ) : null}
            {timeAgo(post.createdAt)}
          </p>
        </div>
        {post.pinned && (
          <span className="chip border-warn/40 text-warn">
            <Pin size={11} /> Pinned
          </span>
        )}
      </header>

      <div className="flex flex-col gap-2">
        {post.title &&
          (full ? (
            <h1 className="h-display text-2xl">{post.title}</h1>
          ) : (
            <Link href={href} className="font-display text-lg font-semibold hover:text-primary">
              {post.title}
            </Link>
          ))}
        <p className={`whitespace-pre-wrap text-ink-soft ${full ? '' : 'line-clamp-6'}`}>{post.body}</p>
      </div>

      {post.clipUrl &&
        (full ? (
          <ClipPreview url={post.clipUrl} />
        ) : (
          <Link href={href}>
            <ClipPreview url={post.clipUrl} compact />
          </Link>
        ))}

      <div className="border-t border-line pt-2">
        <PostActions
          postId={post.id}
          href={href}
          liked={post.likes.length > 0}
          likes={post._count.likes}
          comments={post._count.comments}
          pinned={post.pinned}
          canDelete={post.author.id === viewerId || isMod}
          canPin={isMod}
          afterDeleteHref={full ? `/community/${spaceSlug}` : undefined}
        />
      </div>
    </article>
  );
}
