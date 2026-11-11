import { getYouTubeId } from '@/lib/vod/source';

/** Plain embed for lesson videos: YouTube iframe or native video with controls. */
export default function LessonVideo({ url, title }: { url: string; title: string }) {
  const yt = getYouTubeId(url);
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-black shadow-card">
      {yt ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1`}
          title={title}
          className="absolute inset-0 size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <video src={url} controls playsInline className="absolute inset-0 size-full object-contain" />
      )}
    </div>
  );
}
