import { Navigate } from "react-router-dom";
import type { JSX } from "react/jsx-runtime";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
