'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

import { becomeCoach } from '@/actions/course.actions';
import { cn } from '@/lib/utils';

export default function BecomeCoachButton({ className, label = 'Become a coach' }: { className?: string; label?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          await becomeCoach();
          router.refresh();
        })
      }
      className={cn('btn-primary', className)}
    >
      <Sparkles size={15} /> {pending ? 'Setting up…' : label}
    </button>
  );
}
