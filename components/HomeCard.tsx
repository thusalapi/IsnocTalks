'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils';

const tones = {
  violet: 'from-primary/25 text-primary border-primary/30',
  cyan: 'from-accent/20 text-accent border-accent/30',
  pink: 'from-pink-500/20 text-pink-400 border-pink-500/30',
  amber: 'from-amber-400/20 text-amber-300 border-amber-400/30',
} as const;

interface HomeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: keyof typeof tones;
  handleClick?: () => void;
}

const HomeCard = ({ icon: Icon, title, description, tone = 'violet', handleClick }: HomeCardProps) => {
  return (
    <button
      onClick={handleClick}
      className="card card-hover group relative flex min-h-[176px] flex-col justify-between overflow-hidden p-5 text-left"
    >
      <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-60', tones[tone].split(' ')[0])} />
      <div className="relative flex items-start justify-between">
        <span className={cn('flex-center size-11 rounded-xl border bg-surface-2', tones[tone])}>
          <Icon size={20} />
        </span>
        <ArrowUpRight size={18} className="text-ink-faint transition group-hover:text-ink" />
      </div>
      <div className="relative">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-ink-muted">{description}</p>
      </div>
    </button>
  );
};

export default HomeCard;
