import { Lightbulb } from 'lucide-react';

import PageHeader from '@/components/layout/PageHeader';
import NewVodForm from '@/components/vod/NewVodForm';

export const metadata = { title: 'New VOD review' };

export default function NewVodPage() {
  return (
    <section>
      <PageHeader
        eyebrow="Train"
        title="New VOD review"
        description="Add a gameplay clip, then pause, draw and leave timestamped notes."
      />
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="card p-6 sm:p-8">
          <NewVodForm />
        </div>
        <aside className="card h-fit p-6">
          <div className="flex items-center gap-2">
            <Lightbulb size={18} className="text-warn" />
            <p className="font-display font-semibold">Tips for a great review</p>
          </div>
          <ol className="mt-4 flex list-decimal flex-col gap-3 pl-5 text-sm text-ink-muted marker:text-primary">
            <li>Upload the clip to YouTube as unlisted and paste the link.</li>
            <li>Pause on the moment the round was lost, not where it ended.</li>
            <li>Use arrows for movement and circles for crosshair placement.</li>
            <li>Keep each note to one fix the player can practise.</li>
            <li>Turn on sharing and send the link to your student.</li>
          </ol>
        </aside>
      </div>
    </section>
  );
}
