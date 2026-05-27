import React, { createContext, useContext, useEffect, useState } from "react";

// interface JwtPayload {
//   userId: number;
//   role: "candidate" | "company";
//   email: string;
//   iat: number;
//   exp: number;
// }

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  userId: number | null;
  role: "candidate" | "company" | null;
  loading: boolean; // 👈 Expose loading state so your layout/routes can wait for initialization
  login: (token: string) => "candidate" | "company" | null;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface CleanJwtPayload {
  id: number;
  email: string;
  role: string;
  exp: number;
  iss: string;
  aud: string;
}

function parseJwt(token: string): CleanJwtPayload | null {
  try {
    if (!token) return null;

    // 1. Vytáhneme prostřední část (Payload)
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    // 2. Dekódování z Base64Url na Base64 string
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    // 3. Bezpečné dekódování UTF-8 stringu
    const binString = atob(base64);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
    const rawPayload = JSON.parse(new TextDecoder().decode(bytes));

    return {
      id: parseInt(
        rawPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] || rawPayload["nameid"],
      ),
      email:
        rawPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ] || rawPayload["email"],
      role:
        rawPayload[
          "http://schemas.microsoft.com/wsex/2008/06/identity/claims/role"
        ] ||
        rawPayload["role"] ||
        rawPayload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ],
      exp: rawPayload.exp,
      iss: rawPayload.iss,
      aud: rawPayload.aud,
    };
  } catch (error) {
    console.error("Failed to parse JWT", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<"candidate" | "company" | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // 👈 Starts at true on refresh

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const payload = parseJwt(storedToken);
      if (payload) {
        // Check expiration to ensure token is still active (optional but recommended)
        const isExpired = payload.exp * 1000 < Date.now();
        if (!isExpired) {
          setToken(storedToken);
          setUserId(payload.id);
          // Standardize casing to match what the client-side expectations expect
          setRole(payload.role?.toLowerCase() as "candidate" | "company");
        } else {
          localStorage.removeItem("token");
        }
      }
    }
    setLoading(false); // 👈 Verification is done, components are safe to render now
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    const payload = parseJwt(newToken);

    if (payload) {
      setUserId(payload.id);

      // Normalize casing (e.g., "Company" -> "company")
      const userRole = payload.role?.toLowerCase() as "candidate" | "company";
      setRole(userRole);

      return userRole; // Return the role here so the login page can use it instantly
    }

    return null;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserId(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        userId,
        role,
        loading, // 👈 Added to context value
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}
