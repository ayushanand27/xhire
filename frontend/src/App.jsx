import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ProblemPage from "./pages/ProblemPage";
import ProblemsPage from "./pages/ProblemsPage";
import SessionPage from "./pages/SessionPage";
import RoomGrid from "./components/RoomGrid.jsx";
import RoomPage from "./pages/RoomPage.jsx";
// New UI (frontend-only) routes
import Landing from "./newui/pages/Landing.jsx";
import Dashboard from "./newui/pages/Dashboard.jsx";
import InterviewRoom from "./newui/pages/InterviewRoom.jsx";
import Practice from "./newui/pages/Practice.jsx";
import Login from "./newui/pages/Login.jsx";
import Register from "./newui/pages/Register.jsx";

import { Toaster } from "react-hot-toast";

function App() {
  const { isSignedIn, isLoaded } = useUser();

  // this will get rid of the flickering effect
  if (!isLoaded) return null;

  return (
    <>
      <Routes>
        <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/dashboard" element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"} />} />

        {/* Original routes */}
        <Route path="/problems" element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/"} />} />
        <Route path="/problem/:id" element={isSignedIn ? <ProblemPage /> : <Navigate to={"/"} />} />
        <Route path="/session/:id" element={isSignedIn ? <SessionPage /> : <Navigate to={"/"} />} />

        {/* New collaboration room routes */}
        <Route path="/rooms" element={isSignedIn ? <RoomGrid /> : <Navigate to={"/"} />} />
        <Route path="/room/:roomId" element={isSignedIn ? <RoomPage /> : <Navigate to={"/"} />} />

        {/* New UI (frontend-only) - always accessible for design/deploy */}
        <Route path="/ui" element={<Landing />} />
        <Route path="/ui/login" element={<Login />} />
        <Route path="/ui/register" element={<Register />} />
        <Route path="/ui/dashboard" element={<Dashboard />} />
        <Route path="/ui/room/:roomId" element={<InterviewRoom />} />
        <Route path="/ui/practice" element={<Practice />} />
      </Routes>

      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;
