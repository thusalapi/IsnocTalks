import Link from 'next/link';
import { Lock, MessagesSquare, Plus, Users } from 'lucide-react';

import PostCard from '@/components/community/PostCard';
import SpaceBadge from '@/components/community/SpaceBadge';
import PageHeader from '@/components/layout/PageHeader';
import { db } from '@/lib/db';
import { requireDbUser } from '@/lib/db/user';
import { postInclude } from '@/lib/community';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Community' };

export default async function CommunityPage() {
  const user = await requireDbUser();
  const isCoach = user.role !== 'STUDENT';

  const spaces = await db.space.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { members: true, posts: true } },
      members: { where: { userId: user.id }, select: { userId: true } },
      course: { select: { title: true } },
    },
  });
  const joinedIds = spaces.filter((s) => s.members.length > 0).map((s) => s.id);

  const feed = joinedIds.length
    ? await db.post.findMany({
        where: { spaceId: { in: joinedIds } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { ...postInclude(user.id), space: { select: { slug: true, name: true, ownerId: true } } },
      })
    : [];

  return (
    <section>
      <PageHeader
        eyebrow="Grow"
        title="Community"
        description="Share clips, ask questions and learn with other players and coaches."
        actions={
          isCoach && (
            <Link href="/community/new" className="btn-primary">
              <Plus size={16} /> New space
            </Link>
          )
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <h2 className="h-display text-xl">Latest from your spaces</h2>
          {feed.length === 0 ? (
            <div className="card relative flex flex-col items-center overflow-hidden px-6 py-14 text-center">
              <div className="absolute inset-0 bg-grid opacity-60 mask-fade-b" />
              <MessagesSquare size={30} className="relative text-primary" />
              <p className="h-display relative mt-4 text-xl">Your feed is empty</p>
              <p className="relative mt-1 max-w-sm text-sm text-ink-muted">
                Join a space to see its posts here, or open one and start the conversation.
              </p>
            </div>
          ) : (
            feed.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                spaceSlug={p.space.slug}
                spaceName={p.space.name}
                viewerId={user.id}
                isMod={p.space.ownerId === user.id}
              />
            ))
          )}
        </div>

        <aside className="flex flex-col gap-3">
          <h2 className="h-display text-xl">Spaces</h2>
          {spaces.length === 0 && (
            <div className="card p-5 text-sm text-ink-muted">
              No spaces yet. {isCoach ? 'Create the first one.' : 'Coaches can create spaces for their communities.'}
            </div>
          )}
          {spaces.map((s) => (
            <Link key={s.id} href={`/community/${s.slug}`} className="card card-hover flex items-center gap-3 p-4">
              <SpaceBadge name={s.name} color={s.color} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate font-semibold">
                  {s.name} {s.access === 'COURSE' && <Lock size={12} className="text-warn" />}
                </p>
                <p className="flex items-center gap-1 text-xs text-ink-muted">
                  <Users size={12} /> {s._count.members} · {s._count.posts} posts
                  {s.course ? ` · ${s.course.title}` : ''}
                </p>
              </div>
              {s.members.length > 0 && <span className="chip py-0.5 text-[10px] text-success">Joined</span>}
            </Link>
          ))}
        </aside>
      </div>
    </section>
  );
}
