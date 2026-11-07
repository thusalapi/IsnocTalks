'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { nanoid } from 'nanoid';

import { drawShape, textFontPx } from '@/lib/vod/render';
import type { Point, Shape, Tool } from '@/lib/vod/types';

type Props = {
  shapes: Shape[];
  tool: Tool;
  color: string;
  size: number;
  editable: boolean;
  onAdd?: (shape: Shape) => void;
  /** Called on a plain click when no drawing tool is active */
  onSurfaceClick?: () => void;
};

const clamp = (v: number) => Math.min(1, Math.max(0, v));

export default function DrawingCanvas({
  shapes,
  tool,
  color,
  size,
  editable,
  onAdd,
  onSurfaceClick,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [draft, setDraft] = useState<Shape | null>(null);
  const [textAt, setTextAt] = useState<Point | null>(null);
  const [textValue, setTextValue] = useState('');
  const drawing = useRef(false);
  const draftRef = useRef<Shape | null>(null);
  draftRef.current = draft;

  // Keep the canvas sharp and matched to its container size.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDims({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dims.w === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(dims.w * dpr);
    canvas.height = Math.round(dims.h * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, dims.w, dims.h);
    for (const s of shapes) drawShape(ctx, s, dims.w, dims.h);
    if (draft) drawShape(ctx, draft, dims.w, dims.h);
  }, [shapes, draft, dims]);

  const toPoint = useCallback((e: React.PointerEvent): Point => {
    const r = wrapRef.current!.getBoundingClientRect();
    return { x: clamp((e.clientX - r.left) / r.width), y: clamp((e.clientY - r.top) / r.height) };
  }, []);

  const commitText = () => {
    if (textAt && textValue.trim()) {
      onAdd?.({ id: nanoid(8), type: 'text', color, size, at: textAt, text: textValue.trim() });
    }
    setTextAt(null);
    setTextValue('');
  };

  const isDrawing = editable && tool !== 'none';

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isDrawing) {
      onSurfaceClick?.();
      return;
    }
    e.preventDefault();
    const p = toPoint(e);
    if (tool === 'text') {
      if (textAt) commitText();
      setTextAt(p);
      return;
    }
    (e.target as Element).setPointerCapture(e.pointerId);
    drawing.current = true;
    const id = nanoid(8);
    if (tool === 'pen') setDraft({ id, type: 'pen', color, size, points: [p] });
    else setDraft({ id, type: tool, color, size, from: p, to: p });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const p = toPoint(e);
    setDraft((d) => {
      if (!d) return d;
      if (d.type === 'pen') {
        const last = d.points[d.points.length - 1];
        if (Math.hypot(last.x - p.x, last.y - p.y) < 0.002) return d;
        return { ...d, points: [...d.points, p] };
      }
      if (d.type === 'text') return d;
      return { ...d, to: p };
    });
  };

  const onPointerUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const d = draftRef.current;
    setDraft(null);
    if (!d) return;
    const tooSmall =
      d.type !== 'pen' && d.type !== 'text' && Math.hypot(d.to.x - d.from.x, d.to.y - d.from.y) < 0.005;
    if (!tooSmall) onAdd?.(d);
  };

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 touch-none select-none"
      style={{ cursor: isDrawing ? (tool === 'text' ? 'text' : 'crosshair') : 'pointer' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 size-full" />
      {textAt && (
        <input
          autoFocus
          value={textValue}
          maxLength={200}
          onChange={(e) => setTextValue(e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') commitText();
            if (e.key === 'Escape') {
              setTextAt(null);
              setTextValue('');
            }
          }}
          onBlur={commitText}
          placeholder="Type, then Enter"
          className="absolute min-w-[160px] rounded border border-white/40 bg-black/60 px-1 font-bold outline-none"
          style={{
            left: `${textAt.x * 100}%`,
            top: `${textAt.y * 100}%`,
            color,
            fontSize: textFontPx(size, dims.w || 800),
          }}
        />
      )}
    </div>
  );
}
