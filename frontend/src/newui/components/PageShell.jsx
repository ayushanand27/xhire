export default function PageShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      {children}
    </div>
  );
}
