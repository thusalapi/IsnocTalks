'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Globe, Lock, Trash2 } from 'lucide-react';

import { deleteCourse, setCoursePublished } from '@/actions/course.actions';
import { useToast } from '@/components/ui/use-toast';

export default function CourseAdminBar({ courseId, slug, published }: { courseId: string; slug: string; published: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/courses/${slug}`} className="btn-ghost">
        <Eye size={15} /> Preview
      </Link>
      <button
        disabled={pending}
        className={published ? 'btn-ghost' : 'btn-primary'}
        onClick={() =>
          start(async () => {
            try {
              await setCoursePublished(courseId, !published);
              toast({ title: published ? 'Course unpublished' : 'Course is live' });
              router.refresh();
            } catch (e) {
              toast({ title: e instanceof Error ? e.message : 'Could not update', variant: 'destructive' });
            }
          })
        }
      >
        {published ? <Lock size={15} /> : <Globe size={15} />}
        {published ? 'Unpublish' : 'Publish'}
      </button>
      <button
        disabled={pending}
        className="btn-ghost hover:border-danger/50 hover:text-danger"
        onClick={() => confirm('Delete this course for good? Students lose access.') && start(() => deleteCourse(courseId))}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
