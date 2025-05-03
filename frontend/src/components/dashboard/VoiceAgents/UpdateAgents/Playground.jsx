import React, { useEffect } from 'react'
import { useConnectionState, useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';


const Playground = ({ setIsConnected, isConnected,handleHangUpCall }) => {
    const { localParticipant } = useLocalParticipant();
    const roomState = useConnectionState();
    const room = useRoomContext()
    console.log(roomState,"roomState")
    useEffect(() => {
        if (roomState === ConnectionState.Connected) {
            setTimeout(() => {
                setIsConnected(true)
            }, 3000)
            localParticipant.setMicrophoneEnabled(true);
        }

        if (roomState === ConnectionState.Disconnected && isConnected) {
            handleHangUpCall()
        }
    }, [localParticipant, roomState]);

    return (
        !isConnected &&
        <p className="text-accent-teal mt-1">
            Connecting...
        </p>
    )
}

export default Playground