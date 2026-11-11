import { cn } from '@/lib/utils';

/** Coloured square with the space's initial, used as its icon. */
export default function SpaceBadge({ name, color, className }: { name: string; color: string; className?: string }) {
  return (
    <span
      className={cn('flex-center size-11 shrink-0 rounded-xl font-display text-lg font-bold', className)}
      style={{ backgroundColor: `${color}26`, color, boxShadow: `inset 0 0 0 1px ${color}55` }}
    >
      {name.trim()[0]?.toUpperCase() ?? '#'}
    </span>
  );
}
