'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, Pin, ThumbsUp, Trash2 } from 'lucide-react';

import { deletePost, toggleLike, togglePin } from '@/actions/community.actions';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function PostActions({
  postId,
  href,
  liked,
  likes,
  comments,
  pinned,
  canDelete,
  canPin,
  afterDeleteHref,
}: {
  postId: string;
  href: string;
  liked: boolean;
  likes: number;
  comments: number;
  pinned: boolean;
  canDelete: boolean;
  canPin: boolean;
  afterDeleteHref?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, setState] = useState({ liked, likes });
  const [pending, start] = useTransition();

  const guard = (fn: () => Promise<unknown>, msg?: string) =>
    start(async () => {
      try {
        await fn();
        if (msg) toast({ title: msg });
        router.refresh();
      } catch (e) {
        toast({ title: e instanceof Error ? e.message : 'Something went wrong', variant: 'destructive' });
      }
    });

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            setState((s) => ({ liked: !s.liked, likes: s.likes + (s.liked ? -1 : 1) }));
            const res = await toggleLike(postId);
            setState({ liked: res.liked, likes: res.count });
          })
        }
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition hover:bg-surface-2',
          state.liked ? 'text-primary' : 'text-ink-muted'
        )}
      >
        <ThumbsUp size={15} className={cn(state.liked && 'fill-primary/30')} /> GG {state.likes > 0 && state.likes}
      </button>
      <Link href={href} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-ink-muted transition hover:bg-surface-2">
        <MessageSquare size={15} /> {comments} {comments === 1 ? 'comment' : 'comments'}
      </Link>
      <div className="ml-auto flex gap-1">
        {canPin && (
          <button
            disabled={pending}
            title={pinned ? 'Unpin' : 'Pin to top'}
            onClick={() => guard(() => togglePin(postId), pinned ? 'Post unpinned' : 'Post pinned')}
            className={cn('btn-icon size-8', pinned && 'text-warn')}
          >
            <Pin size={14} />
          </button>
        )}
        {canDelete && (
          <button
            disabled={pending}
            title="Delete post"
            onClick={() =>
              confirm('Delete this post?') &&
              guard(async () => {
                await deletePost(postId);
                if (afterDeleteHref) router.push(afterDeleteHref);
              }, 'Post deleted')
            }
            className="btn-icon size-8 hover:text-danger"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
