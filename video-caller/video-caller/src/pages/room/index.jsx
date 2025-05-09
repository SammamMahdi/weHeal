import React, { useRef, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {ZegoUIKitPrebuilt} from '@zegocloud/zego-uikit-prebuilt'

const RoomPage = () => {
    const {roomId} = useParams();
    const [searchParams] = useSearchParams();
    const username = searchParams.get('username') || 'Anonymous';
    const meetingRef = useRef(null);

    useEffect(() => {
        const myMeeting = async() => {
            const appID = 1742634545;
            const serverSecret = "9180fd51d8b4ee9027f9ccbf6313baf0";
            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appID,
                serverSecret,
                roomId,
                Date.now().toString(),
                username
            );
            
            const zc = ZegoUIKitPrebuilt.create(kitToken);
            zc.joinRoom({
                container: meetingRef.current,
                sharedLinks: [
                    {
                        name: 'Copy Link',
                        url: `http://localhost:3000/room/${roomId}?username=${encodeURIComponent(username)}`
                    }
                ],
                scenario: {
                    mode: ZegoUIKitPrebuilt.OneONoneCall,
                },
                showScreenSharingButton: true,
                turnOnMicrophoneWhenJoining: false,
                useFrontFacingCamera: true,
                showMyCameraToggleButton: true,
                showMyMicrophoneToggleButton: true,
                showAudioVideoSettingsButton: true,
                audioVideoConfig: {
                    channelCount: { ideal: 1 },
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false,
                    sampleRate: 44100
                }
            });
        };
        myMeeting();
    }, [roomId, username]);

    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <div ref={meetingRef} style={{ height: '100%', width: '100%' }} />
        </div>
    );
};

export default RoomPage;
