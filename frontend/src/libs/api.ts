const API_BASE = "https://your-backend-url/api/auth";

export async function registerCandidate(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const response = await fetch(`${API_BASE}/register/candidate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}
