/* eslint-disable camelcase */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import HomeCard from './HomeCard';
import MeetingModal from './MeetingModal';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';
import { Textarea } from './ui/textarea';
import ReactDatePicker from 'react-datepicker';
import { useToast } from './ui/use-toast';
import { Input } from './ui/input';
import { CalendarPlus, Clapperboard, LogIn, Zap } from 'lucide-react';
import { getBaseUrl } from '@/lib/url';

const initialValues = {
  dateTime: new Date(),
  description: '',
  link: '',
};

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined
  >(undefined);
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<Call>();
  const client = useStreamVideoClient();
  const { user } = useUser();
  const { toast } = useToast();

  const createMeeting = async () => {
    if (!client || !user) return;
    try {
      if (!values.dateTime) {
        toast({ title: 'Please select a date and time' });
        return;
      }
      const id = crypto.randomUUID();
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');
      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant session';
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });
      setCallDetail(call);
      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }
      toast({
        title: 'Session created',
      });
    } catch (error) {
      console.error(error);
      toast({ title: 'Could not create the session', variant: 'destructive' });
    }
  };

  if (!client || !user)
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card h-[176px] animate-pulse" />
        ))}
      </div>
    );

  const meetingLink = `${getBaseUrl()}/meeting/${callDetail?.id}`;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <HomeCard
        icon={Zap}
        tone="violet"
        title="Instant session"
        description="Jump into a live coaching call now"
        handleClick={() => setMeetingState('isInstantMeeting')}
      />
      <HomeCard
        icon={LogIn}
        tone="cyan"
        title="Join session"
        description="Enter with an invite link"
        handleClick={() => setMeetingState('isJoiningMeeting')}
      />
      <HomeCard
        icon={CalendarPlus}
        tone="pink"
        title="Schedule coaching"
        description="Book a time with your student"
        handleClick={() => setMeetingState('isScheduleMeeting')}
      />
      <HomeCard
        icon={Clapperboard}
        tone="amber"
        title="Recordings"
        description="Rewatch past sessions"
        handleClick={() => router.push('/recordings')}
      />

      {!callDetail ? (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Schedule a session"
          handleClick={createMeeting}
        >
          <div className="flex flex-col gap-2.5">
            <label className="label">
              Add a description
            </label>
            <Textarea
              className="input min-h-[96px]"
              onChange={(e) =>
                setValues({ ...values, description: e.target.value })
              }
            />
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <label className="label">
              Select Date and Time
            </label>
            <ReactDatePicker
              selected={values.dateTime}
              onChange={(date) => setValues({ ...values, dateTime: date! })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="input"
            />
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Session scheduled"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({ title: 'Link Copied' });
          }}
          image={'/icons/checked.svg'}
          buttonIcon="/icons/copy.svg"
          className="text-center"
          buttonText="Copy invite link"
        />
      )}

      <MeetingModal
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Join a session"
        className="text-center"
        buttonText="Join session"
        handleClick={() => router.push(values.link)}
      >
        <Input
          placeholder="Paste the invite link"
          onChange={(e) => setValues({ ...values, link: e.target.value })}
          className="input h-auto"
        />
      </MeetingModal>

      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Start an instant session"
        className="text-center"
        buttonText="Go live now"
        handleClick={createMeeting}
      />
    </section>
  );
};

export default MeetingTypeList;
