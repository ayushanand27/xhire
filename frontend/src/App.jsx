import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router-dom";
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

import { Toaster } from "react-hot-toast";

function App() {
  const { isSignedIn, isLoaded } = useUser();

  // this will get rid of the flickering effect
  if (!isLoaded) return null;

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/dashboard" element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"} />} />

        {/* Auth routes */}
        <Route path="/login" element={!isSignedIn ? <Login /> : <Navigate to={"/dashboard"} />} />
        <Route path="/register" element={!isSignedIn ? <Register /> : <Navigate to={"/dashboard"} />} />

        {/* Original routes */}
        <Route path="/problems" element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/"} />} />
        <Route path="/problem/:id" element={isSignedIn ? <ProblemPage /> : <Navigate to={"/"} />} />
        <Route path="/session/:id" element={isSignedIn ? <SessionPage /> : <Navigate to={"/"} />} />

        {/* Collaboration room routes */}
        <Route path="/rooms" element={isSignedIn ? <RoomGrid /> : <Navigate to={"/"} />} />
        <Route path="/room/:roomId" element={isSignedIn ? <RoomPage /> : <Navigate to={"/"} />} />
        {/* Practice alias */}
        <Route path="/practice" element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/"} />} />
        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster toastOptions={{ duration: 3000 }} />
    </ErrorBoundary>
  );
}

export default App;
