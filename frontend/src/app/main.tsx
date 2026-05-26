import "../index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "../api/AuthContext";
import { UserProvider } from "../context/UserContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import CandidateDashboard from "./pages/CandidateDashboard";
import LoginPage from "./pages/LoginPage";
import CompanyDashboard from "./pages/CompanyDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/candidate/dashboard",
    element: (
      <ProtectedRoute>
        <UserProvider>
          <CandidateDashboard />
        </UserProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/company/dashboard",
    element: <CompanyDashboard />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
