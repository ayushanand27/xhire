import Navbar from "../components/Navbar";
import PageShell from "../components/PageShell";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Dashboard() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  return (
    <PageShell>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 space-y-8">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="text-gray-300">Create or join interview rooms, or jump into solo practice.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-5 rounded-lg bg-gray-900 ring-1 ring-white/10">
            <h3 className="font-medium">Create interview room</h3>
            <p className="text-sm text-gray-400">Spin up a new room for your next interview.</p>
            <button className="btn btn-sm btn-primary mt-3" onClick={()=> navigate(`/ui/room/${crypto.randomUUID().slice(0,8)}`)}>Create</button>
          </div>

          <div className="p-5 rounded-lg bg-gray-900 ring-1 ring-white/10">
            <h3 className="font-medium">Join a room</h3>
            <div className="mt-2 flex gap-2">
              <input className="input input-sm input-bordered bg-gray-800 flex-1" placeholder="Enter Room ID" value={roomId} onChange={e=>setRoomId(e.target.value)} />
              <button className="btn btn-sm" onClick={()=> roomId && navigate(`/ui/room/${roomId}`)}>Join</button>
            </div>
          </div>

          <div className="p-5 rounded-lg bg-gray-900 ring-1 ring-white/10">
            <h3 className="font-medium">Practice mode</h3>
            <p className="text-sm text-gray-400">Solo coding practice with problems & tests.</p>
            <Link to="/ui/practice" className="btn btn-sm btn-ghost mt-3">Open Practice</Link>
          </div>
        </div>
      </main>
      <Footer />
    </PageShell>
  );
}
