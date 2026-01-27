export default function VideoGrid({ participants = [], activeId = null, max = 5 }) {
  const shown = participants.slice(0, max);
  const cols = shown.length <= 2 ? "grid-cols-2" : shown.length <= 4 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-3";
  return (
    <div className={`grid gap-3 ${cols}`}>
      {shown.map((p) => (
        <div key={p.id} className={`relative aspect-video rounded-lg bg-gray-800 overflow-hidden ring-1 ring-white/10 ${activeId===p.id?"outline outline-2 outline-emerald-500": ""}`}>
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            <div className="text-center">
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-xl">{p.initials}</div>
              <div className="text-sm font-medium">{p.name}</div>
              <div className="text-xs text-gray-400">{p.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
