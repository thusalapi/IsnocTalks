"use client"

import { VideoPreview, useCall } from '@stream-io/video-react-sdk'
import React, { useEffect, useState } from 'react'

const MeetingSetup = () => {
  
    const [isMicCamToggledOn, setIsMicCamToggledOn] = useState(false);

    const call = useCall();

    if(!call) throw new Error('Call not found');

    useEffect(() => {
        if(isMicCamToggledOn) {
        call?.camera.disable();
        call?.microphone.disable();
        }
        else {
        call?.camera.enable();
        call?.microphone.enable();
        }

    }, [isMicCamToggledOn, call?.camera, call?.microphone]);
  return (
    <div className='flex h-screen w-full flex-col items-center justify-center gap-3 text-white'>
        <h1 className='text-2xl font-bold'>Setup</h1>
        <VideoPreview />
        <div className='flex h-16 items-center justify-center gap-3'>

            <label className='flex items-center gap-2'>
            <input type='checkbox' checked={isMicCamToggledOn} onChange={() => setIsMicCamToggledOn(!isMicCamToggledOn)} />
            <span>Turn off Camera and Microphone</span>
            </label>
        </div>
    </div>
  )
}

export default MeetingSetup