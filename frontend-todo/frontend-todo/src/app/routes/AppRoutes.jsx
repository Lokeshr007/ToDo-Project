// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\app\routes\AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthContext";

import { ProtectedRoute } from "@/app/routes/ProtectedRoute";
import PublicRoute from "@/app/routes/PublicRoute";
import AppLayout from "@/shared/layout/AppLayout";
import AuthLayout from "@/shared/layout/AuthLayout";

// Auth Pages
import Login from "@/features/auth/pages/Login";
import Register from "@/features/auth/pages/Register";
import VerifyOtp from "@/features/auth/pages/VerifyOtp";
import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import ForgotPasswordOtp from "@/features/auth/pages/ForgotPasswordOtp";
import GoogleSuccess from "@/features/auth/pages/GoogleSuccess";

// Public Pages
import Home from "@/features/public/pages/Home";
import MouseGlow from "@/features/public/pages/MouseGlow";

// AI Assistant Pages
import AIAssistantPage from "@/features/ai-assistant/pages/AIAssistantPage";
import EnterpriseAIPage from "@/features/ai-assistant/pages/EnterpriseAIPage";
import LearningPathPage from "@/features/ai-assistant/pages/LearningPathPage";
import ProjectStructurePage from "@/features/ai-assistant/pages/ProjectStructurePage";

// Protected Pages
import Dashboard from "@/features/dashboard/pages/Dashboard";
import Projects from "@/features/projects/pages/Projects";
import ProjectView from "@/features/projects/pages/ProjectView";
import Boards from "@/features/boards/pages/Boards";
import BoardView from "@/features/boards/pages/BoardView";
import TodoPage from "@/features/todos/pages/TodoPage";
import DiscoveriesPage from "@/features/todos/pages/DiscoveriesPage";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import Settings from "@/features/profile/pages/Settings";
import DeviceSessions from "@/features/profile/pages/DeviceSessions";
import TodoEnvironment from "@/features/todos/pages/TodoEnvironment";
import TimeCapsule from "@/features/todos/pages/TimeCapsule";
import Help from "@/features/help/pages/Help";

const AppRoutes = () => {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ================= PUBLIC AUTH ROUTES ================= */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forgot-password-otp" element={<ForgotPasswordOtp />} />
          <Route path="/google-success" element={<GoogleSuccess />} />
        </Route>
      </Route>

      {/* ================= PUBLIC LANDING ================= */}
      <Route path="/" element={<Home />} />
      <Route path="/mouse-glow" element={<MouseGlow />} />

      {/* ================= PROTECTED WORKSPACE ROUTES ================= */}
      <Route path="/app" element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Projects */}
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:projectId" element={<ProjectView />} />
          
          {/* Boards */}
          <Route path="boards" element={<Boards />} />
          <Route path="boards/:boardId" element={<BoardView />} />
          
          {/* Todos */}
          <Route path="todos" element={<TodoPage />} />
          <Route path="todo-environment" element={<TodoEnvironment />} />
          <Route path="time-capsule" element={<TimeCapsule />} />
          <Route path="discoveries" element={<DiscoveriesPage />} />
          
          {/* AI Assistant Routes - Updated to match your structure */}
          <Route path="ai">
            <Route index element={<Navigate to="assistant" replace />} />
            <Route path="assistant" element={<AIAssistantPage />} />
            <Route path="enterprise" element={<EnterpriseAIPage />} />
            <Route path="learning-paths" element={<LearningPathPage />} />
            <Route path="learning-paths/:pathId" element={<LearningPathPage />} />
            <Route path="project-structure/:projectId" element={<ProjectStructurePage />} />
          </Route>
          
          {/* Profile */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<Settings />} />
          <Route path="sessions" element={<DeviceSessions />} />
          
          {/* Help */}
          <Route path="help" element={<Help />} />
        </Route>
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;