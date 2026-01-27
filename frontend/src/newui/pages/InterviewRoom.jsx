import Navbar from "../components/Navbar";
import PageShell from "../components/PageShell";
import Footer from "../components/Footer";
import VideoGrid from "../components/VideoGrid";
import CallControls from "../components/CallControls";
import CodePanel from "../components/CodePanel";
import ChatPanel from "../components/ChatPanel";
import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";

export default function InterviewRoom() {
  const { roomId } = useParams();
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [recording, setRecording] = useState(false);
  const [code, setCode] = useState("// Start coding here\n");
  const [messages, setMessages] = useState([]);

  const participants = useMemo(()=>[
    { id:"u1", name:"Candidate", initials:"CA", role:"candidate" },
    { id:"u2", name:"Interviewer A", initials:"IA", role:"interviewer" },
    { id:"u3", name:"Interviewer B", initials:"IB", role:"interviewer" },
  ],[]);

  return (
    <PageShell>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Room • {roomId}</h2>
            <p className="text-sm text-gray-400">Up to 5 participants. Active speaker highlighted.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-3">
            <VideoGrid participants={participants} activeId={participants[0].id} />
            <div className="rounded-lg bg-gray-900 ring-1 ring-white/10 p-3">
              <CallControls
                onLeave={()=>window.history.back()}
                onToggleMic={()=>setMic(v=>!v)}
                onToggleCam={()=>setCam(v=>!v)}
                onShareScreen={()=>alert("Mock: share screen")}
                onRecord={()=>setRecording(v=>!v)}
                mic={mic}
                cam={cam}
                recording={recording}
              />
            </div>
          </div>
          <div className="lg:col-span-4 space-y-3">
            <div className="h-[340px]"><CodePanel value={code} onChange={setCode} /></div>
            <div className="h-[260px]"><ChatPanel items={messages} onSend={(t)=>setMessages(m=>[...m, {author:"You", text:t}])} /></div>
          </div>
        </div>
      </main>
      <Footer />
    </PageShell>
  );
}
