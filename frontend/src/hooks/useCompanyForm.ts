import { useState } from "react";
import type { CompanyFormData } from "../libs/types";

export function useCompanyForm() {
  const [companyForm, setCompanyForm] = useState<CompanyFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  return { companyForm, setCompanyForm };
}
