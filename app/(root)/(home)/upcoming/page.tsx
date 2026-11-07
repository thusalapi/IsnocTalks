import CallList from '@/components/CallList';
import PageHeader from '@/components/layout/PageHeader';

export const metadata = { title: 'Upcoming' };

export default function UpcomingPage() {
  return (
    <section>
      <PageHeader eyebrow="Sessions" title="Upcoming" description="Sessions on your calendar. Start them from here or share the invite." />
      <CallList type="upcoming" />
    </section>
  );
}
