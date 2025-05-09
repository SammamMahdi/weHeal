import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const VideoCall = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const meetingRef = useRef(null);
  const [callDetails, setCallDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get ZegoCloud credentials from environment variables
  const appID = process.env.REACT_APP_ZEGO_APP_ID;
  const serverSecret = process.env.REACT_APP_ZEGO_SERVER_SECRET;

  // Get username from query or fallback to participantName
  const searchParams = new URLSearchParams(location.search);
  const username = searchParams.get('username') || callDetails?.participantName || 'Anonymous';

  useEffect(() => {
    console.log('VideoCall mounted');
    const fetchCallDetails = async () => {
      try {
        const response = await api.get(`/video-call/${appointmentId}`);
        setCallDetails(response.data.data);
        setLoading(false);
        console.log('Fetched call details:', response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching call details');
        setLoading(false);
        console.error('Error fetching call details:', err);
      }
    };
    fetchCallDetails();
  }, [appointmentId]);

  useEffect(() => {
    if (!callDetails || !appID || !serverSecret) return;
    console.log('callDetails:', callDetails);
    console.log('meetingRef.current:', meetingRef.current);
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      Number(appID),
      serverSecret,
      callDetails.roomId,
      Date.now().toString(),
      username
    );
    const zc = ZegoUIKitPrebuilt.create(kitToken);
    console.log('Initializing ZegoCloud UI');
    zc.joinRoom({
      container: meetingRef.current,
      sharedLinks: [
        {
          name: 'Copy Link',
          url: `${window.location.origin}/video-call/${callDetails.roomId}?username=${encodeURIComponent(username)}`
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
      },
      onLeave: () => navigate(-1)
    });
  }, [callDetails, appID, serverSecret, username, navigate]);

  if (!appID || !serverSecret) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">
          ZegoCloud credentials are missing. Please set REACT_APP_ZEGO_APP_ID and REACT_APP_ZEGO_SERVER_SECRET in your .env file and restart the frontend server.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <div ref={meetingRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default VideoCall; 