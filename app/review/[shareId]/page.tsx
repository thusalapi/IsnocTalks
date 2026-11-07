import Link from 'next/link';

import Logo from '@/components/brand/Logo';
import { notFound } from 'next/navigation';

import ReviewRoom from '@/components/vod/ReviewRoom';
import { db } from '@/lib/db';
import { toAnnotation } from '@/lib/vod/serialize';

export const dynamic = 'force-dynamic';

/** Public, read-only view of a review shared by link. */
export default async function SharedReviewPage({ params }: { params: { shareId: string } }) {
  const vod = await db.vod.findUnique({
    where: { shareId: params.shareId },
    include: {
      annotations: { orderBy: { timestamp: 'asc' } },
      owner: { select: { name: true } },
    },
  });
  if (!vod || vod.visibility !== 'LINK') notFound();

  return (
    <main className="relative min-h-screen bg-bg px-4 pb-12 sm:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-radial-fade" />
      <header className="relative mb-8 flex h-16 items-center justify-between border-b border-line">
        <Logo />
        <div className="flex items-center gap-3">
          {vod.owner.name && <span className="chip">Reviewed by {vod.owner.name}</span>}
          <Link href="/sign-up" className="btn-primary hidden py-2 sm:inline-flex">
            Get coached
          </Link>
        </div>
      </header>
      <div className="relative mx-auto max-w-[1400px]">
      <ReviewRoom
        vod={{
          id: vod.id,
          title: vod.title,
          game: vod.game,
          description: vod.description,
          videoUrl: vod.videoUrl,
          source: vod.source,
          shareId: vod.shareId,
          visibility: vod.visibility,
        }}
        initialAnnotations={vod.annotations.map(toAnnotation)}
        canEdit={false}
        baseUrl=""
      />
      </div>
    </main>
  );
}
