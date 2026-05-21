const API_BASE = "https://backend-739221723573.europe-west3.run.app/api";

export async function registerCandidate(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  location?: string;
  headline?: string;
  summary?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}) {
  const res = await fetch(`${API_BASE}/auth/register/candidate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Registration failed");
  }

  return data;
}
