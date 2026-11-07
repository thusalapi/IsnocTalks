/* eslint-disable @next/next/no-img-element */
import { MessageSquareText, Pause, Pencil, Circle, MoveUpRight, Type } from 'lucide-react';

/** Static product preview of the VOD review room, drawn with CSS and SVG. */
export default function HeroMock() {
  return (
    <div className="relative animate-float">
      <div className="absolute -inset-6 rounded-[32px] bg-brand-gradient opacity-25 blur-3xl" />
      <div className="card relative overflow-hidden p-3 shadow-glow">
        {/* window bar */}
        <div className="mb-3 flex items-center gap-2 px-1">
          <span className="size-2.5 rounded-full bg-danger/80" />
          <span className="size-2.5 rounded-full bg-warn/80" />
          <span className="size-2.5 rounded-full bg-success/80" />
          <span className="ml-3 truncate text-xs text-ink-faint">Ranked · Round 7 retake · VOD review</span>
          <span className="chip ml-auto hidden border-danger/40 text-rose-300 sm:inline-flex">
            <span className="size-1.5 rounded-full bg-danger" /> Coach drawing
          </span>
        </div>

        <div className="flex gap-3">
          {/* tool rail */}
          <div className="hidden flex-col gap-2 sm:flex">
            {[Pencil, MoveUpRight, Circle, Type].map((I, i) => (
              <span
                key={i}
                className={`flex-center size-8 rounded-lg border ${i === 1 ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-surface-2 text-ink-faint'}`}
              >
                <I size={14} />
              </span>
            ))}
          </div>

          {/* game frame */}
          <div className="relative aspect-video flex-1 overflow-hidden rounded-xl border border-line">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(120% 80% at 70% 30%, #2a2148 0%, #141228 45%, #0a0a14 100%), linear-gradient(180deg,#1b1733,#0b0b16)',
              }}
            />
            {/* abstract level geometry */}
            <div className="absolute bottom-0 left-0 h-[46%] w-[38%] bg-[#1c1835] [clip-path:polygon(0_20%,100%_0,100%_100%,0_100%)]" />
            <div className="absolute bottom-0 right-0 h-[58%] w-[30%] bg-[#211b3d] [clip-path:polygon(0_0,100%_12%,100%_100%,0_100%)]" />
            <div className="absolute bottom-[30%] left-[44%] h-[28%] w-[10%] rounded-sm bg-[#2b2350]" />
            <div className="absolute inset-0 bg-grid opacity-40" />
            {/* enemy markers */}
            <span className="absolute left-[63%] top-[38%] size-3 rounded-full bg-danger shadow-[0_0_14px_#F43F5E]" />
            <span className="absolute left-[78%] top-[46%] size-3 rounded-full bg-danger shadow-[0_0_14px_#F43F5E]" />
            {/* crosshair */}
            <div className="absolute left-[46%] top-[58%] -translate-x-1/2 -translate-y-1/2">
              <div className="h-0.5 w-5 bg-accent" />
              <div className="absolute left-1/2 top-1/2 h-5 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-accent" />
            </div>
            {/* drawings */}
            <svg viewBox="0 0 100 56" className="absolute inset-0 size-full" preserveAspectRatio="none">
              <path
                d="M46 33 C 52 28, 57 24, 61.5 22.5"
                fill="none"
                stroke="#F43F5E"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeDasharray="40"
                strokeDashoffset="40"
                className="animate-dash"
              />
              <path d="M61.5 22.5 l-2.6 -0.2 l1.2 2.2 z" fill="#F43F5E" />
              <ellipse cx="63.5" cy="21.6" rx="5" ry="4" fill="none" stroke="#FBBF24" strokeWidth="0.6" />
              <path d="M20 46 q 10 -6 18 -2" fill="none" stroke="#22D3EE" strokeWidth="0.6" strokeDasharray="1.5 1.2" />
            </svg>
            <div className="absolute left-[50%] top-[12%] rounded-md bg-black/70 px-2 py-1 font-display text-[10px] font-bold text-warn sm:text-xs">
              Pre-aim head height
            </div>
            {/* webcams */}
            <div className="absolute right-2 top-2 flex flex-col gap-1.5">
              {['/images/avatar-1.jpeg', '/images/avatar-3.png'].map((src, i) => (
                <div key={src} className="relative h-10 w-14 overflow-hidden rounded-md border border-white/10 sm:h-12 sm:w-16">
                  <img src={src} alt="" className="size-full object-cover" />
                  <span className="absolute bottom-0.5 left-1 text-[8px] font-semibold text-white/90">{i ? 'Student' : 'Coach'}</span>
                </div>
              ))}
            </div>
            {/* note bubble */}
            <div className="absolute bottom-3 left-3 right-3 flex items-start gap-2 rounded-lg border border-white/10 bg-black/70 p-2 text-[10px] backdrop-blur sm:text-xs">
              <MessageSquareText size={14} className="mt-0.5 shrink-0 text-accent" />
              <span className="text-ink-soft">
                <b className="text-ink">0:42</b> Your crosshair is at chest height. Hold head level before you swing.
              </span>
            </div>
          </div>
        </div>

        {/* timeline */}
        <div className="mt-3 flex items-center gap-3 px-1">
          <span className="flex-center size-7 rounded-lg bg-primary-600">
            <Pause size={12} />
          </span>
          <div className="relative h-1.5 flex-1 rounded-full bg-surface-3">
            <div className="absolute inset-y-0 left-0 w-[38%] rounded-full bg-brand-gradient" />
            {[18, 38, 61, 83].map((l) => (
              <span
                key={l}
                className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-accent"
                style={{ left: `${l}%` }}
              />
            ))}
          </div>
          <span className="font-mono text-[10px] text-ink-muted">0:42 / 1:52</span>
        </div>
      </div>
    </div>
  );
}
