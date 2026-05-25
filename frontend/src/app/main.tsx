import "../index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import CandidateDashboard from "./pages/CandidateDashboard";
import Login from "./pages/Login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
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
