/* eslint-disable @next/next/no-img-element */
import { Play } from 'lucide-react';

import { getYouTubeId } from '@/lib/vod/source';

/** Shows a clip as an embedded player (full) or a thumbnail (compact). */
export default function ClipPreview({ url, compact }: { url: string; compact?: boolean }) {
  const yt = getYouTubeId(url);
  if (!yt) {
    return compact ? (
      <span className="chip w-fit">
        <Play size={12} /> Video clip
      </span>
    ) : (
      <video src={url} controls playsInline className="aspect-video w-full rounded-xl border border-line bg-black" />
    );
  }
  if (compact) {
    return (
      <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-xl border border-line">
        <img src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`} alt="" className="size-full object-cover" />
        <span className="flex-center absolute inset-0 bg-black/30">
          <span className="flex-center size-12 rounded-full bg-primary-600/90 shadow-glow">
            <Play size={20} className="ml-0.5" />
          </span>
        </span>
      </div>
    );
  }
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-line bg-black">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${yt}?rel=0`}
        title="Clip"
        className="absolute inset-0 size-full"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  );
}
