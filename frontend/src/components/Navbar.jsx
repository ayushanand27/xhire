import { Link, useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { PageContainer } from "./PageShell.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (_) {}
  };
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <PageContainer className="py-3 flex items-center justify-between">
        <Link to="/" className="ripple text-lg font-semibold tracking-tight hover:opacity-90 transition-transform hover:scale-[1.02] active:scale-95">
          <span className="text-primary">x</span>Hire
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/" className="ripple hover:text-foreground transition-colors transition-transform hover:scale-[1.05] active:scale-95">Home</Link>
          <Link to="/dashboard" className="ripple hover:text-foreground transition-colors transition-transform hover:scale-[1.05] active:scale-95">Dashboard</Link>
          <Link to="/practice" className="ripple hover:text-foreground transition-colors transition-transform hover:scale-[1.05] active:scale-95">Practice</Link>
        </nav>
        <div className="flex items-center gap-2">
          {!isSignedIn ? (
            <>
              <Link to="/login" className="ripple px-3 py-1.5 rounded-md text-sm bg-transparent hover:bg-muted transition-colors transition-transform hover:scale-[1.02] active:scale-95 border border-transparent">Log in</Link>
              <Link to="/register" className="ripple px-3 py-1.5 rounded-md text-sm bg-primary text-primary-foreground shadow-md hover:shadow-lg transition transition-transform hover:scale-[1.02] active:scale-95">Get Started</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="ripple px-3 py-1.5 rounded-md text-sm bg-transparent hover:bg-muted transition-colors transition-transform hover:scale-[1.02] active:scale-95 border border-transparent">Dashboard</Link>
              <button onClick={handleSignOut} className="ripple px-3 py-1.5 rounded-md text-sm bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors transition-transform hover:scale-[1.02] active:scale-95">Sign out</button>
            </>
          )}
        </div>
      </PageContainer>
    </header>
  );
}
