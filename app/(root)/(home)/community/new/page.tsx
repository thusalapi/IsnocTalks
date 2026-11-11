import BecomeCoachButton from '@/components/BecomeCoachButton';
import SpaceForm from '@/components/community/SpaceForm';
import PageHeader from '@/components/layout/PageHeader';
import { db } from '@/lib/db';
import { requireDbUser } from '@/lib/db/user';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'New space' };

export default async function NewSpacePage() {
  const user = await requireDbUser();
  const courses = await db.course.findMany({ where: { coachId: user.id }, select: { id: true, title: true } });

  return (
    <section>
      <PageHeader
        eyebrow="Community"
        title="Create a space"
        description="A space is a channel for one topic, game or course. Members can post clips, questions and tips."
      />
      {user.role === 'STUDENT' ? (
        <div className="card flex flex-col items-start gap-3 p-6">
          <p className="font-display text-lg font-semibold">Coaches create spaces</p>
          <p className="text-sm text-ink-muted">Switch to a coach account to start your own community.</p>
          <BecomeCoachButton />
        </div>
      ) : (
        <div className="card max-w-2xl p-6 sm:p-8">
          <SpaceForm courses={courses} />
        </div>
      )}
    </section>
  );
}
