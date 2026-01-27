import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-gray-950/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <Link to="/ui" className="text-xl font-semibold tracking-tight">
          xHire
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <Link to="/ui" className="hover:text-white">Home</Link>
          <Link to="/ui/dashboard" className="hover:text-white">Dashboard</Link>
          <Link to="/ui/practice" className="hover:text-white">Practice</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/ui/login" className="btn btn-sm btn-ghost">Log in</Link>
          <Link to="/ui/register" className="btn btn-sm btn-primary">Get Started</Link>
        </div>
      </div>
    </header>
  );
}
