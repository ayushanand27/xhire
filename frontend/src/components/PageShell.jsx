export default function PageShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-black/20 to-transparent" />
      {children}
    </div>
  );
}

export function PageContainer({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
