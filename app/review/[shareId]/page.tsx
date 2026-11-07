import Image from 'next/image';
import Link from 'next/link';
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
    <main className="min-h-screen bg-dark-2 px-4 py-6 sm:px-10">
      <div className="mb-6 flex items-center justify-between text-white">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icons/logo.svg" width={32} height={32} alt="IsnocTalks" />
          <span className="text-xl font-extrabold">IsnocTalks</span>
        </Link>
        {vod.owner.name && <span className="text-sm text-sky-1">Reviewed by {vod.owner.name}</span>}
      </div>
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
    </main>
  );
}
