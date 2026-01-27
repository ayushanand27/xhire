import Editor from "@monaco-editor/react";

export default function CodePanel({ value, onChange, language="javascript" }) {
  return (
    <div className="h-full rounded-lg bg-gray-900 ring-1 ring-white/10 overflow-hidden">
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between text-xs text-gray-400">
        <span>Editor • {language}</span>
        <div className="flex gap-2">
          <button className="btn btn-xs btn-primary">Run</button>
          <button className="btn btn-xs btn-ghost">Tests</button>
        </div>
      </div>
      <div className="h-[calc(100%-40px)]">
        <Editor
          height="100%"
          theme="vs-dark"
          language={language}
          value={value}
          onChange={(v)=>onChange?.(v ?? "")}
          options={{ minimap: { enabled:false }, fontSize:14, lineNumbers:"on" }}
        />
      </div>
    </div>
  );
}
