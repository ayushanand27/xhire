import Navbar from "../components/Navbar";
import PageShell from "../components/PageShell";
import Footer from "../components/Footer";
import CodePanel from "../components/CodePanel";
import { useState } from "react";

export default function Practice() {
  const [code, setCode] = useState("// Practice here\n");
  return (
    <PageShell>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 space-y-6">
        <h2 className="text-2xl font-semibold">Practice Mode</h2>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-[520px]"><CodePanel value={code} onChange={setCode} /></div>
          <div className="lg:col-span-1 rounded-lg bg-gray-900 ring-1 ring-white/10 p-4 space-y-3">
            <div className="text-sm text-gray-300">Problem</div>
            <p className="text-sm text-gray-400">Select a problem on the left, write code, and run tests.</p>
            <div className="space-y-2">
              {["Two Sum","Valid Anagram","Binary Search"].map((p)=> (
                <button key={p} className="btn btn-sm btn-ghost w-full justify-start">{p}</button>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </PageShell>
  );
}
