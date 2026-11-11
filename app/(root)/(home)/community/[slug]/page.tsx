import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GraduationCap, Lock, Users } from 'lucide-react';

import { createPost } from '@/actions/community.actions';
import JoinButton from '@/components/community/JoinButton';
import PostCard from '@/components/community/PostCard';
import PostComposer from '@/components/community/PostComposer';
import SpaceBadge from '@/components/community/SpaceBadge';
import UserAvatar from '@/components/UserAvatar';
import { db } from '@/lib/db';
import { requireDbUser } from '@/lib/db/user';
import { canJoinSpace, postInclude } from '@/lib/community';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const s = await db.space.findUnique({ where: { slug: params.slug }, select: { name: true } });
  return { title: s?.name ?? 'Space' };
}

export default async function SpacePage({ params }: { params: { slug: string } }) {
  const user = await requireDbUser();
  const space = await db.space.findUnique({
    where: { slug: params.slug },
    include: {
      owner: { select: { name: true, imageUrl: true } },
      course: { select: { title: true, slug: true } },
      _count: { select: { members: true } },
      members: { take: 8, orderBy: { joinedAt: 'asc' }, include: { user: { select: { name: true, imageUrl: true } } } },
    },
  });
  if (!space) notFound();

  const membership = await db.spaceMember.findUnique({ where: { spaceId_userId: { spaceId: space.id, userId: user.id } } });
  const isOwner = space.ownerId === user.id;
  const isMod = isOwner || membership?.role === 'MODERATOR';
  const allowed = await canJoinSpace(user.id, space);
  const canRead = space.access === 'OPEN' || !!membership || allowed;

  const posts = canRead
    ? await db.post.findMany({
        where: { spaceId: space.id },
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        take: 50,
        include: postInclude(user.id),
      })
    : [];

  return (
    <section className="flex flex-col gap-6">
      <div className="card relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(60% 120% at 100% 0%, ${space.color}55, transparent)` }} />
        <div className="relative flex flex-wrap items-center gap-5">
          <SpaceBadge name={space.name} color={space.color} className="size-16 rounded-2xl text-2xl" />
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{space.game ?? 'Community space'}</p>
            <h1 className="h-display mt-1 text-3xl">{space.name}</h1>
            {space.description && <p className="mt-2 max-w-2xl text-ink-muted">{space.description}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
              <span className="flex items-center gap-1.5">
                <Users size={14} /> {space._count.members} members
              </span>
              {space.access === 'COURSE' && space.course && (
                <Link href={`/courses/${space.course.slug}`} className="chip border-warn/40 text-warn">
                  <Lock size={11} /> For students of {space.course.title}
                </Link>
              )}
            </div>
          </div>
          {allowed ? (
            <JoinButton spaceId={space.id} joined={!!membership} canLeave={!isOwner} />
          ) : (
            space.course && (
              <Link href={`/courses/${space.course.slug}`} className="btn-primary">
                <GraduationCap size={15} /> Get the course to join
              </Link>
            )
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4">
          {membership && <PostComposer action={createPost.bind(null, space.id)} user={user} />}
          {!canRead ? (
            <div className="card flex flex-col items-center gap-3 p-10 text-center">
              <Lock className="text-warn" />
              <p className="font-display text-lg font-semibold">Members-only space</p>
              <p className="text-sm text-ink-muted">Enrol in the linked course to read and join the conversation.</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="card p-10 text-center text-ink-muted">No posts yet. Start the first conversation.</div>
          ) : (
            posts.map((p) => <PostCard key={p.id} post={p} spaceSlug={space.slug} viewerId={user.id} isMod={isMod} />)
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <div className="card p-5">
            <p className="font-display font-semibold">Members</p>
            <div className="mt-3 flex flex-col gap-2.5">
              {space.members.map((m) => (
                <div key={m.userId} className="flex items-center gap-2.5 text-sm">
                  <UserAvatar name={m.user.name} imageUrl={m.user.imageUrl} className="size-7" />
                  <span className="flex-1 truncate">{m.user.name ?? 'Player'}</span>
                  {m.userId === space.ownerId ? (
                    <span className="text-[10px] font-bold uppercase text-primary">Owner</span>
                  ) : m.role === 'MODERATOR' ? (
                    <span className="text-[10px] font-bold uppercase text-accent">Mod</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5 text-sm text-ink-muted">
            <p className="font-display font-semibold text-ink">Space rules</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 marker:text-primary">
              <li>Be respectful. Roast plays, not people.</li>
              <li>Add context to clips: rank, role, what you want feedback on.</li>
              <li>No cheats, boosting or account selling.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
