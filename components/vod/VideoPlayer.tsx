'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import { getYouTubeId } from '@/lib/vod/source';
import type { VodSourceType } from '@/lib/vod/types';

/** One control surface for both YouTube and plain video files. */
export type PlayerHandle = {
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  getTime: () => number;
  getDuration: () => number;
  isPaused: () => boolean;
  setRate: (rate: number) => void;
  setMuted: (muted: boolean) => void;
};

type Props = {
  source: VodSourceType;
  url: string;
  onReady?: (duration: number) => void;
  onPlayingChange?: (playing: boolean) => void;
  onError?: (message: string) => void;
};

/* ---------- Minimal YouTube IFrame API typings ---------- */
type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (s: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  setPlaybackRate: (r: number) => void;
  mute: () => void;
  unMute: () => void;
  destroy: () => void;
};
type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      width?: string;
      height?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: () => void;
        onStateChange?: (e: { data: number }) => void;
        onError?: (e: { data: number }) => void;
      };
    }
  ) => YTPlayer;
};
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<YTNamespace> | null = null;
function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT!);
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

const YT_PLAYING = 1;
const YT_BUFFERING = 3;

const VideoPlayer = forwardRef<PlayerHandle, Props>(function VideoPlayer(
  { source, url, onReady, onPlayingChange, onError },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytHostRef = useRef<HTMLDivElement>(null);
  const ytRef = useRef<YTPlayer | null>(null);
  const callbacks = useRef({ onReady, onPlayingChange, onError });
  callbacks.current = { onReady, onPlayingChange, onError };

  // Metadata can load before React hydrates and attaches onLoadedMetadata.
  useEffect(() => {
    const v = videoRef.current;
    if (source === 'FILE' && v && v.readyState >= 1) callbacks.current.onReady?.(v.duration);
  }, [source, url]);

  useEffect(() => {
    if (source !== 'YOUTUBE') return;
    const videoId = getYouTubeId(url);
    if (!videoId || !ytHostRef.current) {
      callbacks.current.onError?.('Invalid YouTube link');
      return;
    }

    let cancelled = false;
    const mount = document.createElement('div');
    ytHostRef.current.appendChild(mount);

    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      const player = new YT.Player(mount, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
          fs: 0,
        },
        events: {
          onReady: () => {
            ytRef.current = player;
            callbacks.current.onReady?.(player.getDuration());
          },
          onStateChange: (e) =>
            callbacks.current.onPlayingChange?.(e.data === YT_PLAYING || e.data === YT_BUFFERING),
          onError: () => callbacks.current.onError?.('YouTube could not play this video'),
        },
      });
    });

    return () => {
      cancelled = true;
      ytRef.current?.destroy();
      ytRef.current = null;
      mount.remove();
    };
  }, [source, url]);

  useImperativeHandle(
    ref,
    () => ({
      play: () => {
        if (source === 'YOUTUBE') ytRef.current?.playVideo();
        else videoRef.current?.play().catch(() => {});
      },
      pause: () => {
        if (source === 'YOUTUBE') ytRef.current?.pauseVideo();
        else videoRef.current?.pause();
      },
      seek: (s) => {
        const t = Math.max(0, s);
        if (source === 'YOUTUBE') ytRef.current?.seekTo(t, true);
        else if (videoRef.current) videoRef.current.currentTime = t;
      },
      getTime: () =>
        source === 'YOUTUBE'
          ? ytRef.current?.getCurrentTime() ?? 0
          : videoRef.current?.currentTime ?? 0,
      getDuration: () =>
        source === 'YOUTUBE'
          ? ytRef.current?.getDuration() ?? 0
          : videoRef.current?.duration || 0,
      isPaused: () => {
        if (source === 'YOUTUBE') {
          const st = ytRef.current?.getPlayerState();
          return st !== YT_PLAYING && st !== YT_BUFFERING;
        }
        return videoRef.current?.paused ?? true;
      },
      setRate: (r) => {
        if (source === 'YOUTUBE') ytRef.current?.setPlaybackRate(r);
        else if (videoRef.current) videoRef.current.playbackRate = r;
      },
      setMuted: (m) => {
        if (source === 'YOUTUBE') {
          if (m) ytRef.current?.mute();
          else ytRef.current?.unMute();
        } else if (videoRef.current) videoRef.current.muted = m;
      },
    }),
    [source]
  );

  if (source === 'YOUTUBE') {
    return <div ref={ytHostRef} className="absolute inset-0 [&>iframe]:size-full [&>div]:size-full" />;
  }

  return (
    <video
      ref={videoRef}
      src={url}
      className="absolute inset-0 size-full bg-black object-contain"
      playsInline
      preload="metadata"
      onLoadedMetadata={(e) => onReady?.(e.currentTarget.duration)}
      onPlay={() => onPlayingChange?.(true)}
      onPause={() => onPlayingChange?.(false)}
      onError={() => onError?.('This video link could not be loaded')}
    />
  );
});

export default VideoPlayer;
