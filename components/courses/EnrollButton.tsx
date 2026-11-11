'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock } from 'lucide-react';

import { enroll } from '@/actions/course.actions';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function EnrollButton({
  courseId,
  label,
  className,
  paid,
}: {
  courseId: string;
  label: string;
  className?: string;
  paid?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const res = await enroll(courseId);
            if (res.error) {
              setError(res.error);
              toast({ title: res.error });
              return;
            }
            if (res.redirectTo?.startsWith('http')) window.location.href = res.redirectTo;
            else if (res.redirectTo) router.push(res.redirectTo);
          })
        }
        className={cn('btn-primary w-full py-3 text-base', className)}
      >
        {paid && <Lock size={16} />}
        {pending ? 'Please wait…' : label}
        {!pending && <ArrowRight size={16} />}
      </button>
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </div>
  );
}
