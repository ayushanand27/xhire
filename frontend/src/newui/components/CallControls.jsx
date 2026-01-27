export default function CallControls({ onLeave, onToggleMic, onToggleCam, onShareScreen, onRecord, mic=true, cam=true, recording=false }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button className={`btn btn-sm ${mic?"btn-ghost":"btn-warning"}`} onClick={onToggleMic}>{mic?"Mic On":"Mic Off"}</button>
      <button className={`btn btn-sm ${cam?"btn-ghost":"btn-warning"}`} onClick={onToggleCam}>{cam?"Cam On":"Cam Off"}</button>
      <button className="btn btn-sm btn-ghost" onClick={onShareScreen}>Share Screen</button>
      <button className={`btn btn-sm ${recording?"btn-error":"btn-primary"}`} onClick={onRecord}>{recording?"■ Stop REC":"● Start REC"}</button>
      <button className="btn btn-sm btn-outline" onClick={onLeave}>Leave</button>
    </div>
  );
}
