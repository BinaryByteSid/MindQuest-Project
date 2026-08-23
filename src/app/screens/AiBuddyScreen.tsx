import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router"; // change to "react-router-dom" if that's what your app uses
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { Mic, PhoneOff, ArrowLeft } from "lucide-react";

// Your ElevenLabs Agent ID — set in .env as VITE_ELEVENLABS_AGENT_ID
const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string;

// Public entry point — wraps the actual UI in the required ConversationProvider.
// (As of @elevenlabs/react v1.0, every conversation hook needs a Provider ancestor.)
export default function AiBuddyScreen() {
  return (
    <ConversationProvider>
      <AiBuddyContent />
    </ConversationProvider>
  );
}

function AiBuddyContent() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  // The permission stream has to be released explicitly, otherwise the browser
  // keeps showing the "recording" indicator after the user leaves this screen.
  const micStreamRef = useRef<MediaStream | null>(null);

  const releaseMic = useCallback(() => {
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
  }, []);

  const conversation = useConversation({
    onConnect: () => setError(null),
    onDisconnect: () => {},
    onMessage: (message) => {
      // Useful for debugging / building a transcript later
      console.log("AI Buddy message:", message);
    },
    onError: (message) => {
      console.error("AI Buddy error:", message);
      setError("Something went wrong connecting to your buddy. Please try again.");
    },
  });

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;

  const startConversation = useCallback(async () => {
    if (!AGENT_ID) {
      setError("Missing ElevenLabs agent ID. Add VITE_ELEVENLABS_AGENT_ID to your .env file.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        "This browser cannot access the microphone. Try Chrome, Edge, or Safari over HTTPS."
      );
      return;
    }
    try {
      // Mic permission must be requested before starting the session
      micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: "webrtc",
      });
    } catch (err) {
      console.error(err);
      releaseMic();
      const denied =
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "SecurityError");
      setError(
        denied
          ? "Microphone access is needed to talk to your AI Buddy. Allow it in your browser's address bar, then try again."
          : "Could not start the conversation. Check your connection and try again."
      );
    }
  }, [conversation, releaseMic]);

  const endConversation = useCallback(() => {
    conversation.endSession();
    releaseMic();
  }, [conversation, releaseMic]);

  // Navigating away mid-call left the WebRTC session open and the mic hot.
  const conversationRef = useRef(conversation);
  conversationRef.current = conversation;

  useEffect(
    () => () => {
      conversationRef.current?.endSession?.();
      micStreamRef.current?.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    },
    []
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-10 bg-gradient-to-br from-teal-400 via-blue-500 to-purple-500 text-white">
      <button
        onClick={() => navigate(-1)}
        className="self-start flex items-center gap-1 text-white/80 hover:text-white text-sm"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="flex flex-col items-center gap-4">
        <div
          className={`w-40 h-40 rounded-full bg-white/20 backdrop-blur flex items-center justify-center transition-all duration-500 ${
            isSpeaking ? "scale-110 shadow-[0_0_70px_rgba(255,255,255,0.55)]" : "scale-100"
          }`}
        >
          <div
            className={`w-24 h-24 rounded-full bg-white flex items-center justify-center transition-transform ${
              isConnected && !isSpeaking ? "animate-pulse" : ""
            }`}
          >
            <Mic size={36} className={isConnected ? "text-purple-600" : "text-blue-500"} />
          </div>
        </div>

        <h1 className="text-2xl font-bold mt-4">AI Buddy</h1>
        <p className="text-white/85 text-center max-w-xs">
          {isConnected
            ? isSpeaking
              ? "Your buddy is responding..."
              : "I'm listening — go ahead and talk"
            : "Tap start for a private voice chat with your AI Buddy"}
        </p>

        {error && (
          <p className="text-white bg-red-500/50 px-4 py-2 rounded-lg text-sm max-w-xs text-center">
            {error}
          </p>
        )}
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        {!isConnected ? (
          <button
            onClick={startConversation}
            className="w-full py-4 rounded-full bg-white text-purple-600 font-semibold text-lg shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            <Mic size={20} />
            Start Talking
          </button>
        ) : (
          <button
            onClick={endConversation}
            className="w-full py-4 rounded-full bg-red-500 text-white font-semibold text-lg shadow-lg flex items-center justify-center gap-2 hover:bg-red-600 transition"
          >
            <PhoneOff size={20} />
            End Conversation
          </button>
        )}
        <p className="text-center text-xs text-white/70">
          Your privacy is protected. Conversations are not stored by PsychTriage.
        </p>
      </div>
    </div>
  );
}
