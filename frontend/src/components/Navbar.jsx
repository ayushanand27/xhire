import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { PageContainer } from "./PageShell.jsx";
import { LogOutIcon, ZapIcon } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (_) {}
  };

  return (
    <header className="sticky top-0 z-40 border-b border-primary/10 bg-gradient-to-r from-base-100 via-base-100 to-base-200 backdrop-blur-md shadow-md">
      <PageContainer className="py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-110">
            <ZapIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            xHire
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {isSignedIn && (
            <>
              <NavLink to="/dashboard" isActive={isActive("/dashboard")} label="Dashboard" />
              <NavLink to="/practice" isActive={isActive("/practice")} label="Practice" />
              <NavLink to="/problems" isActive={isActive("/problems")} label="Problems" />
            </>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {!isSignedIn ? (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-base-200 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-base-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                  {user?.firstName?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-sm font-medium hidden md:inline">{user?.firstName}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-base-300 hover:bg-base-400 text-foreground flex items-center gap-2 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <LogOutIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          )}
        </div>
      </PageContainer>
    </header>
  );
}

function NavLink({ to, isActive, label }) {
  return (
    <Link
      to={to}
      className={`relative px-3 py-2 text-sm font-semibold transition-all duration-300 ${
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
      )}
    </Link>
  );
}
