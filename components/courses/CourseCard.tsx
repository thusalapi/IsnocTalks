/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { BookOpen, GraduationCap } from 'lucide-react';

import { LEVEL_LABEL, formatPrice } from '@/lib/format';

type Props = {
  href: string;
  title: string;
  subtitle?: string | null;
  coverUrl?: string | null;
  game?: string | null;
  level: keyof typeof LEVEL_LABEL;
  priceCents: number;
  currency: string;
  lessonCount: number;
  coachName?: string | null;
  badge?: string;
  progress?: number;
};

export default function CourseCard(p: Props) {
  return (
    <Link href={p.href} className="card card-hover group flex flex-col overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-2">
        {p.coverUrl ? (
          <img
            src={p.coverUrl}
            alt=""
            className="size-full object-cover opacity-85 transition duration-300 group-hover:scale-105 group-hover:opacity-100"
          />
        ) : (
          <div className="relative flex-center size-full overflow-hidden bg-surface-2">
            <div className="absolute inset-0 bg-grid opacity-70" />
            <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute -bottom-12 left-6 size-32 rounded-full bg-accent/20 blur-3xl" />
            <GraduationCap size={40} className="relative text-primary" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent" />
        {p.game && (
          <span className="chip absolute left-3 top-3 border-white/10 bg-black/60 backdrop-blur">{p.game}</span>
        )}
        {p.badge && (
          <span className="chip absolute right-3 top-3 border-warn/40 bg-black/60 text-warn backdrop-blur">{p.badge}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">{LEVEL_LABEL[p.level]}</p>
        <h3 className="line-clamp-2 font-display text-lg font-semibold">{p.title}</h3>
        {p.subtitle && <p className="line-clamp-2 text-sm text-ink-muted">{p.subtitle}</p>}
        {typeof p.progress === 'number' && (
          <div className="mt-2">
            <div className="h-1.5 rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${p.progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-ink-muted">{p.progress}% complete</p>
          </div>
        )}
        <div className="mt-auto flex items-center justify-between pt-3 text-sm">
          <span className="flex items-center gap-1.5 text-ink-muted">
            <BookOpen size={14} /> {p.lessonCount} lesson{p.lessonCount === 1 ? '' : 's'}
            {p.coachName ? ` · ${p.coachName}` : ''}
          </span>
          <span className="font-display font-bold text-ink">{formatPrice(p.priceCents, p.currency)}</span>
        </div>
      </div>
    </Link>
  );
}
