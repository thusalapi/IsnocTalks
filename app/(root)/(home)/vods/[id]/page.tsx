import { notFound } from 'next/navigation';

import ReviewRoom from '@/components/vod/ReviewRoom';
import { db } from '@/lib/db';
import { requireDbUser } from '@/lib/db/user';
import { toAnnotation } from '@/lib/vod/serialize';

export const dynamic = 'force-dynamic';

export default async function VodReviewPage({ params }: { params: { id: string } }) {
  const user = await requireDbUser();
  const vod = await db.vod.findUnique({
    where: { id: params.id },
    include: { annotations: { orderBy: { timestamp: 'asc' } } },
  });

  const isOwner = vod?.ownerId === user.id;
  if (!vod || (!isOwner && vod.visibility !== 'LINK')) notFound();

  return (
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
      canEdit={isOwner}
      baseUrl={process.env.NEXT_PUBLIC_BASE_URL ?? ''}
    />
  );
}
