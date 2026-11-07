'use client';
import { useEffect, useState } from 'react';
import { DeviceSettings, VideoPreview, useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { MicOff } from 'lucide-react';

import Alert from './Alert';
import Logo from './brand/Logo';

const MeetingSetup = ({ setIsSetupComplete }: { setIsSetupComplete: (value: boolean) => void }) => {
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived = callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();
  if (!call) throw new Error('useStreamCall must be used within a StreamCall component.');

  const [isMicCamToggled, setIsMicCamToggled] = useState(false);

  useEffect(() => {
    if (isMicCamToggled) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.microphone.enable();
    }
  }, [isMicCamToggled, call.camera, call.microphone]);

  if (callTimeNotArrived)
    return <Alert title={`This session hasn't started yet. It is scheduled for ${callStartsAt.toLocaleString()}.`} />;

  if (callHasEnded) return <Alert title="The host has ended this session." iconUrl="/icons/call-ended.svg" />;

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-bg px-4 py-10 text-ink">
      <div className="absolute inset-0 bg-grid opacity-50 mask-fade-b" />
      <div className="absolute top-0 h-72 w-full bg-radial-fade" />
      <Logo href="/dashboard" className="relative" />
      <div className="relative text-center">
        <p className="eyebrow">Pre-game check</p>
        <h1 className="h-display mt-2 text-3xl">Set up your camera and mic</h1>
      </div>
      <div className="card relative w-full max-w-[720px] overflow-hidden p-3">
        <VideoPreview />
      </div>
      <div className="relative flex flex-wrap items-center justify-center gap-4">
        <label className="chip cursor-pointer py-2 text-sm">
          <input type="checkbox" checked={isMicCamToggled} onChange={(e) => setIsMicCamToggled(e.target.checked)} />
          <MicOff size={14} /> Join with mic and camera off
        </label>
        <DeviceSettings />
      </div>
      <button
        className="btn-primary relative px-10 py-3 text-base"
        onClick={() => {
          call.join();
          setIsSetupComplete(true);
        }}
      >
        Join session
      </button>
    </div>
  );
};

export default MeetingSetup;
