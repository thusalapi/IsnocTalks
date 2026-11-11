'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

import { addComment, deleteComment } from '@/actions/community.actions';
import UserAvatar from '@/components/UserAvatar';
import { useToast } from '@/components/ui/use-toast';

type C = { id: string; body: string; createdLabel: string; author: { id: string; name: string | null; imageUrl: string | null } };

export default function CommentSection({
  postId,
  comments,
  viewer,
  isMod,
  canComment,
}: {
  postId: string;
  comments: C[];
  viewer: { id: string; name: string | null; imageUrl: string | null };
  isMod: boolean;
  canComment: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<unknown>, after?: () => void) =>
    start(async () => {
      try {
        await fn();
        after?.();
        router.refresh();
      } catch (e) {
        toast({ title: e instanceof Error ? e.message : 'Something went wrong', variant: 'destructive' });
      }
    });

  return (
    <section className="card flex flex-col gap-4 p-5">
      <h2 className="font-display text-lg font-semibold">
        {comments.length} comment{comments.length === 1 ? '' : 's'}
      </h2>
      {canComment ? (
        <form
          className="flex gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => addComment(postId, text), () => setText(''));
          }}
        >
          <UserAvatar name={viewer.name} imageUrl={viewer.imageUrl} />
          <div className="flex flex-1 flex-col gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              maxLength={2000}
              placeholder="Add a comment"
              className="input resize-none py-2.5"
            />
            <button disabled={pending || !text.trim()} className="btn-primary self-end py-2">
              {pending ? 'Posting…' : 'Comment'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-ink-muted">Join the space to comment.</p>
      )}
      <ul className="flex flex-col divide-y divide-line">
        {comments.map((c) => (
          <li key={c.id} className="flex gap-3 py-4">
            <UserAvatar name={c.author.name} imageUrl={c.author.imageUrl} className="size-8" />
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-semibold">{c.author.name ?? 'Player'}</span>{' '}
                <span className="text-xs text-ink-faint">{c.createdLabel}</span>
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{c.body}</p>
            </div>
            {(c.author.id === viewer.id || isMod) && (
              <button
                disabled={pending}
                onClick={() => run(() => deleteComment(c.id))}
                className="btn-icon size-7 hover:text-danger"
                title="Delete comment"
              >
                <Trash2 size={13} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
