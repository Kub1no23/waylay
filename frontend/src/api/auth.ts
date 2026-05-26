import axios from "axios";
import sanitizePayload from "./sanitizePayload";

const API = axios.create({
  baseURL: "https://backend-739221723573.europe-west3.run.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach JWT from localStorage on every request
 */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* =========================================================
   Types
========================================================= */

export type LoginResponse = {
  message: string;
  jwt: string;
};

export type RegisterResponse = {
  message: string;
};

/* =========================================================
   Candidate registration
========================================================= */

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
}): Promise<RegisterResponse> {
  const { data } = await API.post(
    "/auth/register/candidate",
    sanitizePayload(payload),
  );

  return data;
}

/* =========================================================
   Company registration
========================================================= */

export async function registerCompany(payload: {
  email: string;
  password: string;
  name: string;
  headquarters?: string;
  address?: string;
  industry?: string;
  description?: string;
}): Promise<RegisterResponse> {
  const { data } = await API.post(
    "/auth/register/company",
    sanitizePayload(payload),
  );

  return data;
}

/* =========================================================
   Login
========================================================= */

export async function login(payload: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const { data } = await API.post<LoginResponse>("/auth/login", payload);

  return data;
}

export { API };
