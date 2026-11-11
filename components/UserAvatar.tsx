/* eslint-disable @next/next/no-img-element */
import { cn } from '@/lib/utils';
import { initials } from '@/lib/format';

export default function UserAvatar({
  name,
  imageUrl,
  className,
}: {
  name?: string | null;
  imageUrl?: string | null;
  className?: string;
}) {
  return imageUrl ? (
    <img src={imageUrl} alt="" className={cn('size-9 shrink-0 rounded-full object-cover ring-2 ring-line', className)} />
  ) : (
    <span
      className={cn(
        'flex-center size-9 shrink-0 rounded-full bg-primary-soft text-xs font-bold text-primary ring-2 ring-line',
        className
      )}
    >
      {initials(name)}
    </span>
  );
}
