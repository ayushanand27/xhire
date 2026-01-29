export default function ChatPanel({ items = [], onSend }) {
  return (
    <div className="h-full rounded-app bg-muted border border-border overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b border-border text-xs text-muted-foreground">Chat / Notes</div>
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {items.length===0 && <div className="text-sm text-muted-foreground">No messages yet.</div>}
        {items.map((m, i)=> (
          <div key={i} className="text-sm"><span className="text-muted-foreground">{m.author}:</span> {m.text}</div>
        ))}
      </div>
      <form className="p-2 border-t border-border flex gap-2" onSubmit={(e)=>{e.preventDefault(); const val=e.target.msg.value.trim(); if(val){onSend?.(val); e.target.reset();}}}>
        <input name="msg" className="input input-sm input-bordered flex-1 bg-background" placeholder="Type a message..." />
        <button className="btn btn-sm btn-primary" type="submit">Send</button>
      </form>
    </div>
  );
}
