import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import ProtectedRoute from "../../components/ProtectedRoute";
import AppLayout from "../../layouts/AppLayout";
import AuthLayout from "../../layouts/AuthLayout";

// Auth Pages
import Login from "../../pages/Login";
import Register from "../../pages/Register";
import VerifyOtp from "../../pages/VerifyOtp";
import ForgotPassword from "../../pages/ForgotPassword";
import ForgotPasswordOtp from "../../pages/ForgotPasswordOtp";
import GoogleSuccess from "../../pages/GoogleSuccess";

// Public Pages
import Home from "../../pages/Home";
import MouseGlow from "../../pages/MouseGlow";

// Protected Pages
import Dashboard from "../../pages/Dashboard";
import Projects from "../../pages/Projects";
import ProjectView from "../../pages/ProjectView";
import Boards from "../../pages/Boards";
import TodoPage from "../../pages/TodoPage";
import AiAssistant from "../../pages/AiAssistant";
import DiscoveriesPage from "../../pages/DiscoveriesPage";
import ProfilePage from "../../pages/ProfilePage";
import Settings from "../../pages/Settings";
import DeviceSessions from "../../pages/DeviceSessions";
import TodoEnvironment from "../../pages/TodoEnvironment";

const AppRoutes = () => {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ================= PUBLIC AUTH ROUTES ================= */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password-otp" element={<ForgotPasswordOtp />} />
        <Route path="/google-success" element={<GoogleSuccess />} />
      </Route>

      {/* ================= PUBLIC LANDING ================= */}
      <Route path="/" element={<Home />} />
      <Route path="/mouse-glow" element={<MouseGlow />} />

      {/* ================= PROTECTED WORKSPACE ROUTES ================= */}

      <Route path="/app" element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          <Route path="dashboard" element={<Dashboard />} />

          <Route path="projects" element={<Projects />} />
          <Route path="projects/:projectId" element={<ProjectView />} />

          <Route path="boards" element={<Boards />} />
          <Route path="boards/:boardId" element={<Boards />} />

          <Route path="todos" element={<TodoPage />} />
          <Route path="todo-environment" element={<TodoEnvironment />} />

          <Route path="ai-assistant" element={<AiAssistant />} />
          <Route path="discoveries" element={<DiscoveriesPage />} />

          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<Settings />} />
          <Route path="sessions" element={<DeviceSessions />} />

        </Route>
      </Route>
      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;