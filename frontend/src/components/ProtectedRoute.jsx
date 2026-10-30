import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="page-message">Loading your account...</div>;
  }
  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }
  if (adminOnly && user.role !== "admin") {
    return <Navigate replace to="/" />;
  }
  return <Outlet />;
}
