import CallList from '@/components/CallList';
import PageHeader from '@/components/layout/PageHeader';

export const metadata = { title: 'Previous' };

export default function PreviousPage() {
  return (
    <section>
      <PageHeader eyebrow="Sessions" title="Previous" description="Sessions that have already ended." />
      <CallList type="ended" />
    </section>
  );
}
