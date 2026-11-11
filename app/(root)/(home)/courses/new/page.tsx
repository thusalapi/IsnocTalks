import { redirect } from 'next/navigation';

import { createCourse } from '@/actions/course.actions';
import BecomeCoachButton from '@/components/BecomeCoachButton';
import CourseDetailsForm from '@/components/courses/CourseDetailsForm';
import PageHeader from '@/components/layout/PageHeader';
import { requireDbUser } from '@/lib/db/user';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'New course' };

export default async function NewCoursePage() {
  const user = await requireDbUser();
  if (!user) redirect('/sign-in');

  return (
    <section>
      <PageHeader eyebrow="Courses" title="Create a course" description="Start with the basics. You can add modules and lessons next." />
      {user.role === 'STUDENT' ? (
        <div className="card flex flex-col items-start gap-3 p-6">
          <p className="font-display text-lg font-semibold">Switch to a coach account first</p>
          <p className="text-sm text-ink-muted">Coaches can create courses and community spaces. You keep everything you have as a student.</p>
          <BecomeCoachButton />
        </div>
      ) : (
        <div className="card max-w-3xl p-6 sm:p-8">
          <CourseDetailsForm action={createCourse} submitLabel="Create course" />
        </div>
      )}
    </section>
  );
}
