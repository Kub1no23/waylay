import "../index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import CandidateDashboard from "./pages/CandidateDashboard";
import LoginPage from "./pages/LoginPage";

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
        <CandidateDashboard />
      </ProtectedRoute>
    ),
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
