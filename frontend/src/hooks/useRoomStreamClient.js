import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { roomAPI } from "../api/rooms";

function useRoomStreamClient(roomId) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    let videoCall = null;
    let chatClientInstance = null;

    const initCall = async () => {
      try {
        const { data } = await roomAPI.getStreamToken(roomId);
        const { token, userId, userName, userImage } = data;

        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );

        setStreamClient(client);

        videoCall = client.call("default", roomId);
        await videoCall.join({ create: true });
        setCall(videoCall);

        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        chatClientInstance = StreamChat.getInstance(apiKey);

        await chatClientInstance.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );
        setChatClient(chatClientInstance);

        const chatChannel = chatClientInstance.channel("messaging", roomId);
        await chatChannel.watch();
        setChannel(chatChannel);
      } catch (error) {
        console.error("Error initializing room Stream call:", error);
        toast.error("Failed to join room video call");
      } finally {
        setIsInitializingCall(false);
      }
    };

    initCall();

    return () => {
      (async () => {
        try {
          if (videoCall) await videoCall.leave();
          if (chatClientInstance) await chatClientInstance.disconnectUser();
          await disconnectStreamClient();
        } catch (error) {
          console.error("Cleanup error (room Stream client):", error);
        }
      })();
    };
  }, [roomId]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useRoomStreamClient;

