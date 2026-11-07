import CallList from '@/components/CallList';
import PageHeader from '@/components/layout/PageHeader';

export const metadata = { title: 'Recordings' };

export default function RecordingsPage() {
  return (
    <section>
      <PageHeader eyebrow="Sessions" title="Recordings" description="Recorded coaching sessions you can rewatch or send to students." />
      <CallList type="recordings" />
    </section>
  );
}
