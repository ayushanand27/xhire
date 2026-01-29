function OutputPanel({ output }) {
  return (
    <div className="h-full bg-background flex flex-col">
      <div className="px-4 py-2 bg-muted border-b border-border font-semibold text-sm">
        Output
      </div>
      <div className="flex-1 overflow-auto p-4">
        {output === null ? (
          <p className="text-muted-foreground text-sm">Click "Run Code" to see the output here...</p>
        ) : output.success ? (
          <pre className="text-sm font-mono text-success whitespace-pre-wrap">{output.output}</pre>
        ) : (
          <div>
            {output.output && (
              <pre className="text-sm font-mono text-foreground whitespace-pre-wrap mb-2">
                {output.output}
              </pre>
            )}
            <pre className="text-sm font-mono text-destructive whitespace-pre-wrap">{output.error}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
export default OutputPanel;
