import { useUser, useAuth } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ProblemPage from "./pages/ProblemPage";
import ProblemsPage from "./pages/ProblemsPage";
import SessionPage from "./pages/SessionPage";
import RoomGrid from "./components/RoomGrid.jsx";
import RoomPage from "./pages/RoomPage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import NotFound from "./pages/NotFound.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { setClerkToken } from "./lib/axios.js";

import { Toaster } from "react-hot-toast";

function App() {
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();

  // Set the Clerk token getter for axios
  useEffect(() => {
    if (isSignedIn && getToken) {
      setClerkToken(getToken);
    }
  }, [isSignedIn, getToken]);

  // this will get rid of the flickering effect
  if (!isLoaded) return null;

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/dashboard" element={isSignedIn ? <DashboardPage /> : <Navigate to={"/login"} />} />

        {/* Auth routes */}
        <Route path="/login/*" element={!isSignedIn ? <Login /> : <Navigate to={"/dashboard"} />} />
        <Route path="/register/*" element={!isSignedIn ? <Register /> : <Navigate to={"/dashboard"} />} />
        <Route path="/sso-callback/*" element={<Navigate to="/login" replace />} />
        <Route path="/sign-in/*" element={<Navigate to="/login" replace />} />
        <Route path="/sign-up/*" element={<Navigate to="/register" replace />} />

        {/* Original routes */}
        <Route path="/problems" element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/login"} />} />
        <Route path="/problem/:id" element={isSignedIn ? <ProblemPage /> : <Navigate to={"/login"} />} />
        <Route path="/session/:id" element={isSignedIn ? <SessionPage /> : <Navigate to={"/login"} />} />

        {/* Collaboration room routes */}
        <Route path="/rooms" element={isSignedIn ? <RoomGrid /> : <Navigate to={"/login"} />} />
        <Route path="/room/:roomId" element={isSignedIn ? <RoomPage /> : <Navigate to={"/login"} />} />
        {/* Practice alias */}
        <Route path="/practice" element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/login"} />} />
        {/* Catch-all */}
        <Route path="*" element={isSignedIn ? <Navigate to="/dashboard" replace /> : <NotFound />} />
      </Routes>

      <Toaster toastOptions={{ duration: 3000 }} />
    </ErrorBoundary>
  );
}

export default App;
