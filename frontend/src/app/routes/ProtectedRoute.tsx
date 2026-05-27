import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading authentication session...</div>; // custom spinner or skeleton UI
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
