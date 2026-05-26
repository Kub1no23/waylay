import type {
  CandidateFormData,
  CompanyFormData,
  ProfileData,
} from "../../libs/types";

export function validateCandidateForm(f: CandidateFormData): string | null {
  if (!f.email) return "Email is required";
  if (!f.email.includes("@")) return "Invalid email";
  if (!f.password) return "Password is required";
  if (f.password.length < 8) return "Password too short";
  if (f.password !== f.confirmPassword) return "Passwords do not match";
  if (!f.firstName) return "First name is required";
  if (!f.lastName) return "Last name is required";
  return null;
}

export function validateCompanyForm(f: CompanyFormData): string | null {
  if (!f.email) return "Email is required";
  if (!f.email.includes("@")) return "Invalid email";
  if (!f.password) return "Password is required";
  if (f.password.length < 8) return "Password too short";
  if (f.password !== f.confirmPassword) return "Passwords do not match";
  if (!f.companyName) return "Company name is required";
  return null;
}

export function validateCandidateProfile(p: ProfileData) {
  if (!p.title) return "Title required";
  if (!p.summary) return "Summary required";
  return null;
}

export function validateCompanyProfile(p: ProfileData) {
  if (!p.title) return "Job title required";
  if (!p.summary) return "Job description required";
  return null;
}
