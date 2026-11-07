'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { navGroups } from '@/constants';
import { cn } from '@/lib/utils';

export default function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6">
      {navGroups.map((group) => (
        <div key={group.title} className="flex flex-col gap-1">
          <p className="px-3 pb-1 font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
            {group.title}
          </p>
          {group.links.map(({ label, route, icon: Icon, soon }) => {
            const active = pathname === route || pathname.startsWith(`${route}/`);
            return (
              <Link
                key={route}
                href={route}
                onClick={onNavigate}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  active
                    ? 'bg-primary-soft text-ink'
                    : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary shadow-glow" />
                )}
                <Icon size={18} className={cn(active ? 'text-primary' : 'text-ink-faint group-hover:text-ink-soft')} />
                <span className="flex-1">{label}</span>
                {soon && (
                  <span className="rounded-md border border-accent/30 bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase text-accent">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
