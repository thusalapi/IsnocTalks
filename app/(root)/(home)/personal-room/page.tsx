'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';
import { Copy, Radio, ShieldCheck, Users, Video } from 'lucide-react';

import PageHeader from '@/components/layout/PageHeader';
import { useGetCallById } from '@/hooks/useGetCallById';
import { useToast } from '@/components/ui/use-toast';
import { getBaseUrl } from '@/lib/url';

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1 border-b border-line py-4 last:border-none sm:flex-row sm:items-center sm:gap-6">
    <p className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
    <p className="truncate font-mono text-sm text-ink-soft">{value}</p>
  </div>
);

const PersonalRoom = () => {
  const router = useRouter();
  const { user } = useUser();
  const client = useStreamVideoClient();
  const { toast } = useToast();

  const meetingId = user?.id;
  const { call } = useGetCallById(meetingId!);

  const startRoom = async () => {
    if (!client || !user) return;
    const newCall = client.call('default', meetingId!);
    if (!call) {
      await newCall.getOrCreate({ data: { starts_at: new Date().toISOString() } });
    }
    router.push(`/meeting/${meetingId}?personal=true`);
  };

  const [origin, setOrigin] = useState('');
  useEffect(() => setOrigin(getBaseUrl()), []);
  const meetingLink = `${origin}/meeting/${meetingId}?personal=true`;

  return (
    <section>
      <PageHeader
        eyebrow="Sessions"
        title="Coaching room"
        description="Your always-on room. Share the link once and students can join any time you go live."
      />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="card relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <span className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex size-3 rounded-full bg-success" />
            </span>
            <p className="font-display text-xl font-semibold">{user?.username || user?.firstName || 'Your'}&apos;s room</p>
          </div>
          <div className="relative mt-4">
            <Row label="Room ID" value={meetingId ?? '…'} />
            <Row label="Invite link" value={meetingLink} />
          </div>
          <div className="relative mt-6 flex flex-wrap gap-3">
            <button className="btn-primary px-6 py-3" onClick={startRoom}>
              <Radio size={16} /> Go live
            </button>
            <button
              className="btn-ghost px-6 py-3"
              onClick={() => {
                navigator.clipboard.writeText(meetingLink);
                toast({ title: 'Invite link copied' });
              }}
            >
              <Copy size={16} /> Copy invite
            </button>
          </div>
        </div>
        <div className="card flex flex-col gap-4 p-6">
          <p className="eyebrow">In the room</p>
          {[
            { icon: Video, t: 'HD video and screen share', d: 'Student shares their game, you coach in real time.' },
            { icon: Users, t: 'Group or 1:1', d: 'Run team scrims reviews or private sessions.' },
            { icon: ShieldCheck, t: 'Host controls', d: 'Mute, remove or end the call for everyone.' },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex gap-3">
              <span className="flex-center size-9 shrink-0 rounded-lg border border-accent/30 bg-accent-soft text-accent">
                <Icon size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold">{t}</p>
                <p className="text-sm text-ink-muted">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonalRoom;
