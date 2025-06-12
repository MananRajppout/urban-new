// import React, { useEffect } from 'react'
// import { useConnectionState, useLocalParticipant, useRoomContext } from '@livekit/components-react';
// import { ConnectionState } from 'livekit-client';


// const Playground = ({ setIsConnected, isConnected,handleHangUpCall }) => {
//     const { localParticipant } = useLocalParticipant();
//     const roomState = useConnectionState();
//     const room = useRoomContext()
//     console.log(roomState,"roomState")
//     useEffect(() => {
//         if (roomState === ConnectionState.Connected) {
//             // setTimeout(() => {
//             //     setIsConnected(true);
//             // }, 3000)
            
//             setIsConnected(true);
//             localParticipant.setMicrophoneEnabled(true);
//         }

//         if (roomState === ConnectionState.Disconnected && isConnected) {
//             handleHangUpCall()
//         }
//     }, [localParticipant, roomState]);

//     return (
//         !isConnected &&
//         <p className="text-accent-teal mt-1">
//             Connecting...
//         </p>
//     )
// }

// export default Playground




import React, { useEffect, useState } from 'react'
import { useConnectionState, useLocalParticipant, useRoomContext, useTracks } from '@livekit/components-react';
import { ConnectionState, Track } from 'livekit-client';

const Playground = ({ setIsConnected, isConnected, handleHangUpCall }) => {
    const { localParticipant } = useLocalParticipant();
    const roomState = useConnectionState();
    const room = useRoomContext();
    
    // Get all tracks (audio/video) from all participants
    const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone], {
        onlySubscribed: true,
    });
    
    console.log(roomState, "roomState");
    console.log(tracks, "tracks");

    useEffect(() => {
        // Only set connected when room is connected AND we have received tracks
        if (roomState === ConnectionState.Connected && tracks.length > 0) {
            setIsConnected(true);
            localParticipant.setMicrophoneEnabled(true);
        }

        if (roomState === ConnectionState.Disconnected && isConnected) {
            handleHangUpCall();
        }
    }, [localParticipant, roomState, tracks, isConnected, setIsConnected, handleHangUpCall]);

    return (
        !isConnected && (
            <p className="text-accent-teal mt-1">
                Connecting...
            </p>
        )
    );
};

export default Playground;