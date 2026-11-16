import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  MessageSquareIcon,
  UsersIcon,
  PhoneOffIcon,
  SendIcon,
  MonitorIcon,
  SparklesIcon,
} from "lucide-react";

function DemoVideoCallUI({ session }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "System",
      text: "Welcome to the 1-on-1 interview session room!",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    {
      id: 2,
      sender: session?.host?.name || "Interviewer",
      text: "Hello! Let's start with the coding problem on the left.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    let stream = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError(false);
      } catch (err) {
        console.warn("Camera preview fallback:", err);
        setCameraError(true);
      }
    }

    if (isVideoOn) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideoOn]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "You",
        text: newMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setNewMessage("");
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
      } else {
        setIsScreenSharing(false);
        setIsVideoOn((prev) => !prev);
      }
    } catch (err) {
      console.warn("Screen share error:", err);
    }
  };

  return (
    <div className="h-full flex flex-col gap-3 relative">
      {/* Header controls */}
      <div className="flex items-center justify-between bg-slate-800 p-3 rounded-xl border border-slate-700 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <UsersIcon className="w-5 h-5 text-indigo-400" />
          <span className="font-semibold text-slate-200 text-sm">
            2 Participants (Live Session)
          </span>
        </div>

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`btn btn-sm gap-2 text-xs font-semibold ${
            isChatOpen ? "btn-primary" : "btn-ghost text-slate-300 hover:bg-slate-700"
          }`}
        >
          <MessageSquareIcon className="size-4" />
          Chat ({messages.length})
        </button>
      </div>

      {/* Main Video Call Area */}
      <div className="flex-1 flex gap-3 overflow-hidden">
        <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative flex flex-col items-center justify-center">
          {/* Main Video Display */}
          {isVideoOn && !cameraError ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-slate-700">
                <VideoOffIcon className="w-10 h-10 text-slate-500" />
              </div>
              <p className="text-slate-300 font-semibold text-base mb-1">
                {cameraError ? "Camera Access Blocked / Unavailable" : "Camera Off"}
              </p>
              <p className="text-slate-500 text-xs max-w-xs">
                {cameraError
                  ? "Allow camera permissions in browser to view live feed."
                  : "Turn on your camera using the controls below."}
              </p>
            </div>
          )}

          {/* Participant Label Overlay */}
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/50 flex items-center gap-2 text-xs text-slate-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {session?.host?.name || "You (Host)"}
          </div>

          {/* Controls Bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-700/80 flex items-center gap-3 shadow-2xl">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-3 rounded-xl transition-all ${
                isMicOn ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
              title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
            >
              {isMicOn ? <MicIcon className="w-5 h-5" /> : <MicOffIcon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 rounded-xl transition-all ${
                isVideoOn ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
              title={isVideoOn ? "Turn Off Camera" : "Turn On Camera"}
            >
              {isVideoOn ? <VideoIcon className="w-5 h-5" /> : <VideoOffIcon className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-3 rounded-xl transition-all ${
                isScreenSharing ? "bg-indigo-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"
              }`}
              title="Share Screen"
            >
              <MonitorIcon className="w-5 h-5" />
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-600/30"
              title="Leave Room"
            >
              <PhoneOffIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Chat Panel */}
        {isChatOpen && (
          <div className="w-80 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden shadow-xl">
            <div className="p-3 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-indigo-400" /> Live Chat
              </h3>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 font-sans text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-xl max-w-[85%] ${
                    msg.sender === "You"
                      ? "ml-auto bg-indigo-600 text-white"
                      : msg.sender === "System"
                      ? "mx-auto bg-slate-900/60 text-slate-400 text-center border border-slate-700/50"
                      : "bg-slate-700 text-slate-200"
                  }`}
                >
                  {msg.sender !== "System" && (
                    <div className="font-semibold text-[10px] opacity-75 mb-0.5">
                      {msg.sender} • {msg.time}
                    </div>
                  )}
                  <div>{msg.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-2.5 bg-slate-900 border-t border-slate-700 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="input input-sm flex-1 bg-slate-800 border-slate-700 text-slate-200 text-xs focus:outline-none"
              />
              <button type="submit" className="btn btn-sm btn-primary px-3">
                <SendIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default DemoVideoCallUI;
