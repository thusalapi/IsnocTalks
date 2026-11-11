import { notFound } from 'next/navigation';

import { updateCourseDetails } from '@/actions/course.actions';
import CourseAdminBar from '@/components/courses/CourseAdminBar';
import CourseDetailsForm from '@/components/courses/CourseDetailsForm';
import CurriculumBuilder from '@/components/courses/CurriculumBuilder';
import CopyLink from '@/components/CopyLink';
import PageHeader from '@/components/layout/PageHeader';
import { requireDbUser } from '@/lib/db/user';
import { getCourseBySlug } from '@/lib/courses';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit course' };

export default async function EditCoursePage({ params }: { params: { slug: string } }) {
  const user = await requireDbUser();
  const course = await getCourseBySlug(params.slug);
  if (!course || (course.coachId !== user.id && user.role !== 'ADMIN')) notFound();

  return (
    <section>
      <PageHeader
        eyebrow={course.published ? 'Live course' : 'Draft course'}
        title={course.title}
        description={`${course._count.enrollments} students enrolled. Changes save to the live course straight away.`}
        actions={<CourseAdminBar courseId={course.id} slug={course.slug} published={course.published} />}
      />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="h-display mb-4 text-xl">Curriculum</h2>
          <CurriculumBuilder
            courseId={course.id}
            modules={course.modules.map((m) => ({
              id: m.id,
              title: m.title,
              lessons: m.lessons.map((l) => ({
                id: l.id,
                title: l.title,
                type: l.type,
                videoUrl: l.videoUrl,
                content: l.content,
                durationMin: l.durationMin,
                isPreview: l.isPreview,
              })),
            }))}
          />
        </div>
        <div>
          <div className="card mb-6 p-5">
            <p className="font-display font-semibold">Public course page</p>
            <p className="mb-3 mt-1 text-sm text-ink-muted">
              {course.published ? 'Share this link anywhere. Visitors can see the course and sign up.' : 'Publish the course to make this link work.'}
            </p>
            <CopyLink path={`/c/${course.slug}`} />
          </div>
          <h2 className="h-display mb-4 text-xl">Details</h2>
          <div className="card p-6">
            <CourseDetailsForm
              action={updateCourseDetails.bind(null, course.id)}
              defaults={course}
              submitLabel="Save details"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
