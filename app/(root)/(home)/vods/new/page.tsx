import NewVodForm from '@/components/vod/NewVodForm';

export default function NewVodPage() {
  return (
    <section className="flex flex-col gap-6 text-white">
      <div>
        <h1 className="text-3xl font-bold">New VOD review</h1>
        <p className="text-sky-1">Add a gameplay clip, then pause, draw and leave timestamped notes.</p>
      </div>
      <NewVodForm />
    </section>
  );
}
