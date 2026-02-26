import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthContext";

const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return !user ? <Outlet /> : <Navigate to="/app/dashboard" replace />;
};

export default PublicRoute;
