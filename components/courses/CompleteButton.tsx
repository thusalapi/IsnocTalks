'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

import { toggleLessonComplete } from '@/actions/course.actions';
import { cn } from '@/lib/utils';

export default function CompleteButton({ lessonId, done }: { lessonId: string; done: boolean }) {
  const [optimistic, setOptimistic] = useState(done);
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          setOptimistic(!optimistic);
          const now = await toggleLessonComplete(lessonId);
          setOptimistic(now);
        })
      }
      className={cn(optimistic ? 'btn border border-success/40 bg-success/10 text-success' : 'btn-primary')}
    >
      {optimistic ? <CheckCircle2 size={16} /> : <Circle size={16} />}
      {optimistic ? 'Completed' : 'Mark as complete'}
    </button>
  );
}
