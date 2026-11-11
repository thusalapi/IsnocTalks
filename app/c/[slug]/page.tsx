import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SignedIn, SignedOut } from '@clerk/nextjs';

import Logo from '@/components/brand/Logo';
import CourseOverview from '@/components/courses/CourseOverview';
import { getCourseBySlug } from '@/lib/courses';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  return { title: course?.title ?? 'Course', description: course?.subtitle ?? undefined };
}

/** Public course page that coaches can share anywhere. */
export default async function PublicCoursePage({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  if (!course || !course.published) notFound();

  return (
    <main className="relative min-h-screen bg-bg px-4 pb-16 sm:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-radial-fade" />
      <header className="relative mx-auto flex h-16 max-w-[1280px] items-center justify-between border-b border-line">
        <Logo />
        <SignedOut>
          <Link href="/sign-in" className="btn-ghost py-2">
            Sign in
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href={`/courses/${course.slug}`} className="btn-primary py-2">
            Open in app
          </Link>
        </SignedIn>
      </header>
      <div className="relative mx-auto mt-8 max-w-[1280px]">
        <CourseOverview course={course} mode="public" />
      </div>
    </main>
  );
}
