import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, initializing } = useAuth();

  // Still attempting the silent session-refresh on load — render nothing
  // rather than bouncing an actually-logged-in user to /login on a reload.
  if (initializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
