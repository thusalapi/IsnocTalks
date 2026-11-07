import Link from 'next/link';

import { cn } from '@/lib/utils';

/** IsnocTalks mark: a hexagon with a play/crosshair core. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('size-8', className)} aria-hidden="true">
      <defs>
        <linearGradient id="isnoc-g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#A78BFA" />
          <stop offset="0.55" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <path
        d="M20 2.5 35.2 11.25v17.5L20 37.5 4.8 28.75v-17.5L20 2.5Z"
        fill="url(#isnoc-g)"
        fillOpacity="0.16"
        stroke="url(#isnoc-g)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M16 13.5v13l10.5-6.5L16 13.5Z" fill="url(#isnoc-g)" />
      <path d="M20 6.5v3M20 30.5v3M8.5 20h3M28.5 20h3" stroke="#22D3EE" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ href = '/', className, compact }: { href?: string; className?: string; compact?: boolean }) {
  return (
    <Link href={href} className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      {!compact && (
        <span className="font-display text-xl font-bold tracking-tight text-ink">
          Isnoc<span className="text-gradient">Talks</span>
        </span>
      )}
    </Link>
  );
}
