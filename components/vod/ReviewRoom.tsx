'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Copy,
  Link2,
  Minus,
  MousePointer2,
  MoveUpRight,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  RotateCw,
  Square,
  Trash2,
  Type,
  Undo2,
  Volume2,
  VolumeX,
} from 'lucide-react';

import { deleteAnnotation, deleteVod, saveAnnotation, setVodVisibility } from '@/actions/vod.actions';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/vod/source';
import { DRAW_COLORS, DRAW_SIZES, type Annotation, type Shape, type Tool, type VodSourceType } from '@/lib/vod/types';
import { useToast } from '@/components/ui/use-toast';
import { getBaseUrl } from '@/lib/url';
import DrawingCanvas from './DrawingCanvas';
import VideoPlayer, { type PlayerHandle } from './VideoPlayer';

export type ReviewVod = {
  id: string;
  title: string;
  game: string | null;
  description: string | null;
  videoUrl: string;
  source: VodSourceType;
  shareId: string;
  visibility: 'PRIVATE' | 'LINK';
};

type Draft = Omit<Annotation, 'id'> & { id?: string };

type Props = {
  vod: ReviewVod;
  initialAnnotations: Annotation[];
  canEdit: boolean;
  baseUrl: string;
};

const TOOLS: { tool: Tool; label: string; icon: typeof Pencil; key: string }[] = [
  { tool: 'none', label: 'Pointer (click to play/pause)', icon: MousePointer2, key: 'V' },
  { tool: 'pen', label: 'Pen', icon: Pencil, key: 'P' },
  { tool: 'arrow', label: 'Arrow', icon: MoveUpRight, key: 'A' },
  { tool: 'line', label: 'Line', icon: Minus, key: 'L' },
  { tool: 'rect', label: 'Rectangle', icon: Square, key: 'R' },
  { tool: 'ellipse', label: 'Circle', icon: Circle, key: 'O' },
  { tool: 'text', label: 'Text', icon: Type, key: 'T' },
];

const RATES = [0.25, 0.5, 1, 1.5, 2];
const DURATIONS = [2, 3, 5, 8, 15];
const FRAME = 1 / 30;

const sortByTime = (list: Annotation[]) => [...list].sort((a, b) => a.timestamp - b.timestamp);

export default function ReviewRoom({ vod, initialAnnotations, canEdit, baseUrl }: Props) {
  const { toast } = useToast();
  const player = useRef<PlayerHandle>(null);
  const [ready, setReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [muted, setMuted] = useState(false);
  const [autoPause, setAutoPause] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [annotations, setAnnotations] = useState(() => sortByTime(initialAnnotations));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [tool, setTool] = useState<Tool>('none');
  const [color, setColor] = useState(DRAW_COLORS[0]);
  const [size, setSize] = useState(DRAW_SIZES[1].value);
  const [isSaving, startSaving] = useTransition();

  const [visibility, setVisibility] = useState(vod.visibility);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Refs read inside the animation loop
  const annotationsRef = useRef(annotations);
  annotationsRef.current = annotations;
  const autoPauseRef = useRef(autoPause);
  autoPauseRef.current = autoPause;
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const lastTime = useRef(0);
  const skipAutoPauseUntil = useRef(0);

  /* ---------- Playback loop ---------- */
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = player.current;
      if (p) {
        const t = p.getTime();
        const prev = lastTime.current;
        lastTime.current = t;
        setTime(t);

        // Stop on a note when playback crosses its timestamp.
        if (
          autoPauseRef.current &&
          !draftRef.current &&
          !p.isPaused() &&
          t > prev &&
          t - prev < 1 &&
          performance.now() > skipAutoPauseUntil.current
        ) {
          const hit = annotationsRef.current.find((a) => a.timestamp > prev && a.timestamp <= t);
          if (hit) {
            p.pause();
            p.seek(hit.timestamp);
            lastTime.current = hit.timestamp;
            setSelectedId(hit.id);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ---------- Player controls ---------- */
  const play = useCallback(() => {
    setSelectedId(null);
    // Do not instantly re-stop on the note we are paused on.
    skipAutoPauseUntil.current = performance.now() + 400;
    player.current?.play();
  }, []);
  const pause = useCallback(() => player.current?.pause(), []);
  const togglePlay = useCallback(() => {
    if (player.current?.isPaused()) play();
    else pause();
  }, [play, pause]);

  const seek = useCallback((t: number) => {
    const clamped = Math.max(0, Math.min(t, duration || t));
    player.current?.seek(clamped);
    lastTime.current = clamped;
    setTime(clamped);
  }, [duration]);

  const step = useCallback(
    (delta: number) => {
      pause();
      seek((player.current?.getTime() ?? 0) + delta);
    },
    [pause, seek]
  );

  const jumpTo = (a: Annotation) => {
    if (draft) return;
    pause();
    seek(a.timestamp);
    setSelectedId(a.id);
  };

  /* ---------- Editing ---------- */
  const beginEdit = useCallback(
    (nextTool?: Tool) => {
      if (!canEdit) return;
      pause();
      const now = player.current?.getTime() ?? 0;
      const selected = annotations.find((a) => a.id === selectedId);
      if (!draftRef.current) {
        setDraft(
          selected
            ? { ...selected, shapes: [...selected.shapes] }
            : { timestamp: now, duration: 3, note: '', shapes: [] }
        );
      }
      if (nextTool) setTool(nextTool);
      else if (tool === 'none') setTool('pen');
    },
    [annotations, canEdit, pause, selectedId, tool]
  );

  const newNote = () => {
    if (!canEdit) return;
    pause();
    setSelectedId(null);
    setDraft({ timestamp: player.current?.getTime() ?? 0, duration: 3, note: '', shapes: [] });
    setTool('pen');
  };

  const pickTool = (t: Tool) => {
    if (t === 'none') {
      setTool('none');
      return;
    }
    beginEdit(t);
  };

  const addShape = (s: Shape) => setDraft((d) => (d ? { ...d, shapes: [...d.shapes, s] } : d));
  const undo = () => setDraft((d) => (d ? { ...d, shapes: d.shapes.slice(0, -1) } : d));
  const clearShapes = () => setDraft((d) => (d ? { ...d, shapes: [] } : d));

  const cancelEdit = () => {
    setDraft(null);
    setTool('none');
  };

  const saveDraft = () => {
    if (!draft) return;
    if (draft.shapes.length === 0 && !draft.note.trim()) {
      toast({ title: 'Add a drawing or a note first' });
      return;
    }
    startSaving(async () => {
      try {
        const saved = await saveAnnotation(vod.id, draft);
        setAnnotations((list) => sortByTime([...list.filter((a) => a.id !== saved.id), saved]));
        setSelectedId(saved.id);
        setDraft(null);
        setTool('none');
        toast({ title: 'Note saved' });
      } catch {
        toast({ title: 'Could not save the note', variant: 'destructive' });
      }
    });
  };

  const removeAnnotation = (id: string) => {
    startSaving(async () => {
      try {
        await deleteAnnotation(vod.id, id);
        setAnnotations((list) => list.filter((a) => a.id !== id));
        if (selectedId === id) setSelectedId(null);
        if (draft?.id === id) cancelEdit();
      } catch {
        toast({ title: 'Could not delete the note', variant: 'destructive' });
      }
    });
  };

  /* ---------- What to draw right now ---------- */
  const visibleShapes = useMemo<Shape[]>(() => {
    if (draft) return draft.shapes;
    if (selectedId && !playing) return annotations.find((a) => a.id === selectedId)?.shapes ?? [];
    return annotations
      .filter((a) => time >= a.timestamp - 0.05 && time <= a.timestamp + a.duration)
      .flatMap((a) => a.shapes);
  }, [draft, selectedId, playing, annotations, time]);

  const activeNote = useMemo(() => {
    if (draft) return null;
    if (selectedId) return annotations.find((a) => a.id === selectedId) ?? null;
    return (
      annotations.find((a) => time >= a.timestamp - 0.05 && time <= a.timestamp + a.duration) ?? null
    );
  }, [draft, selectedId, annotations, time]);

  /* ---------- Keyboard shortcuts ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable]')) return;
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === 'z') {
        e.preventDefault();
        undo();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (k === ' ' || k === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (k === 'arrowleft') step(-5);
      else if (k === 'arrowright') step(5);
      else if (k === ',') step(-FRAME);
      else if (k === '.') step(FRAME);
      else if (k === 'escape') cancelEdit();
      else if (k === 'n' && canEdit) newNote();
      else if (canEdit) {
        const t = TOOLS.find((x) => x.key.toLowerCase() === k);
        if (t) pickTool(t.tool);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  /* ---------- Sharing ---------- */
  const shareUrl = `${(baseUrl || getBaseUrl()).replace(/\/$/, '')}/review/${vod.shareId}`;
  const toggleShare = () => {
    const next = visibility === 'LINK' ? 'PRIVATE' : 'LINK';
    startSaving(async () => {
      const res = await setVodVisibility(vod.id, next);
      setVisibility(res.visibility);
    });
  };
  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  /* ---------- Timeline ---------- */
  const barRef = useRef<HTMLDivElement>(null);
  const scrubbing = useRef(false);
  const seekFromPointer = (clientX: number) => {
    const r = barRef.current?.getBoundingClientRect();
    if (!r || !duration) return;
    seek(((clientX - r.left) / r.width) * duration);
  };

  const pct = (t: number) => (duration ? `${Math.min(100, (t / duration) * 100)}%` : '0%');

  return (
    <div className="flex w-full flex-col gap-5 text-ink">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">VOD review</p>
          <h1 className="h-display text-2xl sm:text-3xl">{vod.title}</h1>
          <p className="text-sm text-sky-1">
            {vod.game ? `${vod.game} · ` : ''}
            {annotations.length} note{annotations.length === 1 ? '' : 's'}
          </p>
        </div>
        {canEdit && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleShare}
              disabled={isSaving}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold',
                visibility === 'LINK' ? 'bg-primary-600 shadow-glow' : 'border border-line bg-surface-2 hover:bg-surface-3'
              )}
            >
              <Link2 size={16} />
              {visibility === 'LINK' ? 'Sharing on' : 'Share with student'}
            </button>
            {visibility === 'LINK' && (
              <button
                onClick={copyLink}
                className="flex items-center gap-2 rounded-lg bg-dark-3 px-3 py-2 text-sm hover:bg-dark-4"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy link'}
              </button>
            )}
            <button
              onClick={() => (confirmDelete ? deleteVod(vod.id) : setConfirmDelete(true))}
              onBlur={() => setConfirmDelete(false)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                confirmDelete ? 'bg-danger' : 'border border-line bg-surface-2 hover:bg-surface-3'
              )}
            >
              <Trash2 size={16} />
              {confirmDelete ? 'Click again to delete' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        {/* Player column */}
        <div className="flex min-w-0 flex-col gap-3">
          {canEdit && (
            <div className="flex flex-wrap items-center gap-2 card p-2">
              {TOOLS.map(({ tool: t, label, icon: Icon, key }) => (
                <button
                  key={t}
                  title={`${label} (${key})`}
                  onClick={() => pickTool(t)}
                  className={cn(
                    'rounded-lg p-2 hover:bg-dark-4',
                    tool === t && (t !== 'none' || !draft) ? 'bg-blue-1' : 'bg-dark-3'
                  )}
                >
                  <Icon size={18} />
                </button>
              ))}
              <span className="mx-1 h-6 w-px bg-white/20" />
              {DRAW_COLORS.map((c) => (
                <button
                  key={c}
                  title={c}
                  onClick={() => setColor(c)}
                  className={cn('size-6 rounded-full border-2', color === c ? 'border-white' : 'border-transparent')}
                  style={{ backgroundColor: c }}
                />
              ))}
              <span className="mx-1 h-6 w-px bg-white/20" />
              {DRAW_SIZES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSize(s.value)}
                  className={cn(
                    'w-8 rounded-lg py-1 text-sm font-semibold',
                    size === s.value ? 'bg-blue-1' : 'bg-dark-3 hover:bg-dark-4'
                  )}
                >
                  {s.label}
                </button>
              ))}
              <span className="mx-1 h-6 w-px bg-white/20" />
              <button
                title="Undo (Ctrl+Z)"
                onClick={undo}
                disabled={!draft?.shapes.length}
                className="rounded-lg bg-dark-3 p-2 hover:bg-dark-4 disabled:opacity-40"
              >
                <Undo2 size={18} />
              </button>
              <button
                title="Clear drawing"
                onClick={clearShapes}
                disabled={!draft?.shapes.length}
                className="rounded-lg bg-dark-3 p-2 hover:bg-dark-4 disabled:opacity-40"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={newNote}
                className="ml-auto flex items-center gap-1 rounded-lg bg-blue-1 px-3 py-2 text-sm font-semibold"
              >
                <Plus size={16} /> Note at {formatTime(time)}
              </button>
            </div>
          )}

          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-black shadow-card">
            <VideoPlayer
              ref={player}
              source={vod.source}
              url={vod.videoUrl}
              onReady={(d) => {
                setReady(true);
                setDuration(d);
              }}
              onPlayingChange={setPlaying}
              onError={setLoadError}
            />
            <DrawingCanvas
              shapes={visibleShapes}
              tool={draft ? tool : 'none'}
              color={color}
              size={size}
              editable={canEdit && !!draft}
              onAdd={addShape}
              onSurfaceClick={togglePlay}
            />
            {draft && (
              <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-danger/90 px-2 py-1 text-xs font-semibold">
                Drawing at {formatTime(draft.timestamp)}
              </div>
            )}
            {!draft && activeNote?.note && (
              <div className="pointer-events-none absolute inset-x-3 bottom-3 mx-auto max-w-2xl rounded-lg bg-black/75 px-3 py-2 text-sm">
                {activeNote.note}
              </div>
            )}
            {(!ready || loadError) && (
              <div className="pointer-events-none absolute inset-0 flex-center text-sm text-sky-1">
                {loadError ?? 'Loading video…'}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div
            ref={barRef}
            className="relative h-2.5 w-full cursor-pointer rounded-full bg-surface-3"
            onPointerDown={(e) => {
              scrubbing.current = true;
              (e.target as Element).setPointerCapture(e.pointerId);
              seekFromPointer(e.clientX);
            }}
            onPointerMove={(e) => scrubbing.current && seekFromPointer(e.clientX)}
            onPointerUp={() => (scrubbing.current = false)}
          >
            <div className="absolute inset-y-0 left-0 rounded-full bg-brand-gradient" style={{ width: pct(time) }} />
            {annotations.map((a) => (
              <button
                key={a.id}
                title={`${formatTime(a.timestamp)} ${a.note}`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => jumpTo(a)}
                className={cn(
                  'absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg shadow-glow-cyan',
                  selectedId === a.id ? 'bg-white' : 'bg-accent'
                )}
                style={{ left: pct(a.timestamp) }}
              />
            ))}
            <div
              className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
              style={{ left: pct(time) }}
            />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button onClick={togglePlay} className="rounded-lg bg-blue-1 p-2" title="Play/Pause (Space)">
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={() => step(-5)} className="rounded-lg bg-dark-3 p-2 hover:bg-dark-4" title="Back 5s (←)">
              <RotateCcw size={18} />
            </button>
            <button onClick={() => step(5)} className="rounded-lg bg-dark-3 p-2 hover:bg-dark-4" title="Forward 5s (→)">
              <RotateCw size={18} />
            </button>
            <button onClick={() => step(-FRAME)} className="rounded-lg bg-dark-3 p-2 hover:bg-dark-4" title="Previous frame (,)">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => step(FRAME)} className="rounded-lg bg-dark-3 p-2 hover:bg-dark-4" title="Next frame (.)">
              <ChevronRight size={18} />
            </button>
            <span className="tabular-nums text-sky-1">
              {formatTime(time)} / {formatTime(duration)}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-sky-1">
                <input type="checkbox" checked={autoPause} onChange={(e) => setAutoPause(e.target.checked)} />
                Stop at notes
              </label>
              <select
                value={rate}
                onChange={(e) => {
                  const r = Number(e.target.value);
                  setRate(r);
                  player.current?.setRate(r);
                }}
                className="rounded-lg bg-dark-3 px-2 py-2"
                title="Playback speed"
              >
                {RATES.map((r) => (
                  <option key={r} value={r}>
                    {r}x
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setMuted(!muted);
                  player.current?.setMuted(!muted);
                }}
                className="rounded-lg bg-dark-3 p-2 hover:bg-dark-4"
                title="Mute"
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <aside className="flex flex-col gap-3">
          {draft && (
            <div className="card flex flex-col gap-3 border-primary/60 p-4 shadow-glow">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{draft.id ? 'Edit note' : 'New note'}</h2>
                <button
                  onClick={() => setDraft({ ...draft, timestamp: player.current?.getTime() ?? draft.timestamp })}
                  className="text-xs text-sky-1 underline"
                  title="Move this note to the current playhead"
                >
                  at {formatTime(draft.timestamp)} · use current time
                </button>
              </div>
              <textarea
                value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                placeholder="What went wrong here, and what should they do instead?"
                rows={4}
                maxLength={4000}
                className="input resize-none"
              />
              <label className="flex items-center justify-between text-sm text-sky-1">
                Show drawing during playback for
                <select
                  value={draft.duration}
                  onChange={(e) => setDraft({ ...draft, duration: Number(e.target.value) })}
                  className="rounded bg-dark-3 px-2 py-1 text-white"
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}s
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={saveDraft}
                  disabled={isSaving}
                  className="flex-1 rounded-lg bg-blue-1 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  {isSaving ? 'Saving…' : 'Save note'}
                </button>
                <button onClick={cancelEdit} className="rounded-lg bg-dark-3 px-3 py-2 text-sm hover:bg-dark-4">
                  Cancel
                </button>
                {draft.id && (
                  <button
                    onClick={() => removeAnnotation(draft.id!)}
                    className="rounded-lg bg-dark-3 px-3 py-2 text-sm hover:bg-red-600"
                    title="Delete note"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="card flex flex-col overflow-hidden">
            <h2 className="border-b border-line p-4 font-display font-semibold">Notes</h2>
            {annotations.length === 0 ? (
              <p className="p-4 text-sm text-sky-1">
                {canEdit
                  ? 'Pause on a mistake, pick a drawing tool and mark it up. Press N to add a note at the current time.'
                  : 'No notes yet.'}
              </p>
            ) : (
              <ul className="max-h-[60vh] overflow-y-auto">
                {annotations.map((a) => (
                  <li key={a.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => jumpTo(a)}
                      onKeyDown={(e) => e.key === 'Enter' && jumpTo(a)}
                      className={cn(
                        'flex w-full cursor-pointer gap-3 border-b border-white/5 p-3 text-left text-sm hover:bg-dark-3',
                        (selectedId === a.id || draft?.id === a.id) && 'bg-dark-3'
                      )}
                    >
                      <span className="shrink-0 rounded bg-blue-1 px-2 py-0.5 font-mono text-xs">
                        {formatTime(a.timestamp)}
                      </span>
                      <span className="line-clamp-3 flex-1 text-sky-2">
                        {a.note || <em className="text-sky-1">Drawing only</em>}
                      </span>
                      {canEdit && !draft && (
                        <button
                          title="Edit note"
                          onClick={(e) => {
                            e.stopPropagation();
                            jumpTo(a);
                            setDraft({ ...a, shapes: [...a.shapes] });
                            setTool('pen');
                          }}
                          className="self-start rounded p-1 hover:bg-dark-4"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {vod.description && (
            <div className="card p-4 text-sm text-ink-soft">
              <h2 className="mb-1 font-semibold text-white">About this VOD</h2>
              <p className="whitespace-pre-wrap">{vod.description}</p>
            </div>
          )}

          <p className="px-1 text-xs text-sky-1">
            Shortcuts: Space play/pause · ←/→ 5s · ,/. frame · Esc cancel
            {canEdit ? ' · N new note · P A L R O T tools · Ctrl+Z undo' : ''}
          </p>
        </aside>
      </div>
    </div>
  );
}
