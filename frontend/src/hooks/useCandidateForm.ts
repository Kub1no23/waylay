import { useState } from "react";
import type { CandidateFormData } from "../libs/types";

export function useCandidateForm() {
  const [candidateForm, setCandidateForm] = useState<CandidateFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    location: "",
    headline: "",
    summary: "",
    githubUrl: "",
    portfolioUrl: "",
  });

  return { candidateForm, setCandidateForm };
}
