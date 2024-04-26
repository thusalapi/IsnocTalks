"use client"

import Image from 'next/image'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import HomeCard from './HomeCard'
import MeetingModal from './MeetingModal';
import { useUser } from '@clerk/nextjs';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { Description } from '@radix-ui/react-dialog';
import { link } from 'fs';

const MeetingTypeList = () => {
    const router = useRouter();
    const [meetingState, setMeetingState] = useState<
    'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined>(undefined);

    const {user} = useUser();
    const client = useStreamVideoClient();
    const [values, setValues] = useState({
        dataTime: new Date(),
        description: '',
        link: '',
 
    });

    const [callDetails, setCallDetails] = useState<Call>();

    const createMeeting = async() => {
            if(!client || user) return;

            try {
                const id = crypto.randomUUID();
                const call = client.call('default', id);

                if(!call) throw new Error('Call not created');

                const startsAt = values.dataTime.toISOString();
                new Date(Date.now()).toISOString();
                const description = values.description || 'Instant Meeting';

                await call.getOrCreate({
                    data: {
                        starts_at: startsAt,
                        custom:{
                            description
                        }
                    },
                })
                
                setCallDetails(call);

                if (!values.description) {
                    router.push(`/meeting/${call.id}`);
                  }
            } catch (error) {
                console.error(error);
                
            }
        }
    return (
    <section className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4'>
      <HomeCard
        img="/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an instant meeting"
        className="bg-orange-1"
        handleClick={() => setMeetingState('isInstantMeeting')}
      />
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="via invitation link"
        className="bg-blue-1"
        handleClick={() => setMeetingState('isJoiningMeeting')}
      />
      <HomeCard
        img="/icons/schedule.svg"
        title="Schedule Meeting"
        description="Plan your meeting"
        className="bg-purple-1"
        handleClick={() => setMeetingState('isScheduleMeeting')}
      />
      <HomeCard
        img="/icons/recordings.svg"
        title="View Recordings"
        description="Meeting Recordings"
        className="bg-yellow-1"
        handleClick={() => router.push('/recordings')}
      />

        <MeetingModal
          isOpen={meetingState === 'isInstantMeeting'}
          onClose={() => setMeetingState(undefined)}
          title ="Start an Instant Meeting"
          className="text-center"
          buttonText="Start Meeting"
          handleClick={createMeeting}
        />
    </section>

  )
}

export default MeetingTypeList