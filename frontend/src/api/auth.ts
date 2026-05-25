import axios from "axios";
import sanitizePayload from "./sanitizePayload";

const API = axios.create({
  baseURL: "https://backend-739221723573.europe-west3.run.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------- candidate ---------- */

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
  const { data } = await API.post(
    "/auth/register/candidate",
    sanitizePayload(payload),
  );

  return data;
}

/* ---------- company ---------- */

export async function registerCompany(payload: {
  email: string;
  password: string;
  name: string;
  headquarters?: string;
  address?: string;
  industry?: string;
  description?: string;
}) {
  const { data } = await API.post(
    "/auth/register/company",
    sanitizePayload(payload),
  );

  return data;
}

/* ---------- login ---------- */

export async function login(payload: { email: string; password: string }) {
  const { data } = await API.post("/auth/login", payload);

  return data;
}
