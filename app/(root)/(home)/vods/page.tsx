import Link from 'next/link';
import { Plus, Youtube, Film } from 'lucide-react';

import { db } from '@/lib/db';
import { requireDbUser } from '@/lib/db/user';

export const dynamic = 'force-dynamic';

export default async function VodsPage() {
  const user = await requireDbUser();
  const vods = await db.vod.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { annotations: true } } },
  });

  return (
    <section className="flex flex-col gap-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">VOD Reviews</h1>
          <p className="text-sky-1">Break down gameplay, draw on mistakes and share the review with your student.</p>
        </div>
        <Link href="/vods/new" className="flex items-center gap-2 rounded-lg bg-blue-1 px-4 py-3 font-semibold">
          <Plus size={18} /> New review
        </Link>
      </div>

      {vods.length === 0 ? (
        <div className="rounded-xl bg-dark-1 p-10 text-center">
          <p className="text-lg font-semibold">No reviews yet</p>
          <p className="mt-1 text-sky-1">Paste a YouTube or video link to start your first breakdown.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {vods.map((v) => (
            <Link
              key={v.id}
              href={`/vods/${v.id}`}
              className="flex flex-col gap-3 rounded-xl bg-dark-1 p-5 transition hover:bg-dark-3"
            >
              <div className="flex items-center gap-2 text-sm text-sky-1">
                {v.source === 'YOUTUBE' ? <Youtube size={16} /> : <Film size={16} />}
                {v.game ?? 'Gameplay'}
                {v.visibility === 'LINK' && (
                  <span className="ml-auto rounded bg-blue-1 px-2 py-0.5 text-xs text-white">Shared</span>
                )}
              </div>
              <h2 className="line-clamp-2 text-lg font-semibold">{v.title}</h2>
              <p className="mt-auto text-sm text-sky-1">
                {v._count.annotations} note{v._count.annotations === 1 ? '' : 's'} · updated{' '}
                {v.updatedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
