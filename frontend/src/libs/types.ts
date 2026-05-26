export type AccountType = "candidate" | "company" | null;
export type RegisterStep = "select-type" | "register-form";

export interface CandidateFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  location?: string;
  headline?: string;
  summary?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface CompanyFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  headquarters?: string;
  address?: string;
  industry?: string;
  description?: string;
}

export interface ProfileData {
  title: string;
  summary: string;
  location: string;
  remotePreference: string;
  yearsExperience: string;
}
