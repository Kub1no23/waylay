import { useNavigate } from "react-router-dom";
import { registerCandidate, registerCompany } from "../../api/auth";

import { useCandidateForm } from "../../hooks/useCandidateForm";
import { useCompanyForm } from "../../hooks/useCompanyForm";
import { useRegisterFlow } from "../../hooks/useRegisterFlow";

import { RegisterLayout } from "../components/sections/register/RegisterLayout";
import { AccountTypeStep } from "../components/sections/register/AccountTypeStep";
import { CandidateForm } from "../components/sections/register/CandidateForm";
import { CompanyForm } from "../components/sections/register/CompanyForm";
import { AuthProgressBar } from "../components/sections/register/AuthProgressBar";

import {
  validateCandidateForm,
  validateCompanyForm,
} from "../utils/validation";

export default function RegisterPage() {
  const navigate = useNavigate();

  const flow = useRegisterFlow();
  const candidate = useCandidateForm();
  const company = useCompanyForm();

  const state = flow.progress;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!flow.accountType) return;

    try {
      flow.setIsLoading(true);
      flow.setError(null);

      // -------------------------
      // 1. VALIDATION LAYER
      // -------------------------
      if (flow.accountType === "candidate") {
        const error = validateCandidateForm(candidate.candidateForm);
        if (error) {
          flow.setError(error);
          return;
        }
      }

      if (flow.accountType === "company") {
        const error = validateCompanyForm(company.companyForm);
        if (error) {
          flow.setError(error);
          return;
        }
      }

      // -------------------------
      // 2. BUILD CLEAN PAYLOAD
      // -------------------------
      if (flow.accountType === "candidate") {
        const f = candidate.candidateForm;

        await registerCandidate({
          email: f.email.trim(),
          password: f.password,
          firstName: f.firstName.trim(),
          lastName: f.lastName.trim(),
          location: f.location?.trim() || undefined,
          headline: f.headline?.trim() || undefined,
          summary: f.summary?.trim() || undefined,
        });
      } else {
        const f = company.companyForm;

        await registerCompany({
          email: f.email.trim(),
          password: f.password,
          name: f.name.trim(),
          headquarters: f.headquarters?.trim() || undefined,
          address: f.address?.trim() || undefined,
          industry: f.industry?.trim() || undefined,
          description: f.description?.trim() || undefined,
        });
      }

      // -------------------------
      // 3. SUCCESS FLOW
      // -------------------------
      navigate("/login", {
        state: {
          email:
            flow.accountType === "candidate"
              ? candidate.candidateForm.email
              : company.companyForm.email,
        },
      });
    } catch (e: any) {
      flow.setError(e?.response?.data?.message || "Registration failed");
    } finally {
      flow.setIsLoading(false);
    }
  };

  return (
    <RegisterLayout>
      <AuthProgressBar state={state} />
      {/* STEP 1 */}
      {flow.step === "select-type" && (
        <AccountTypeStep
          accountType={flow.accountType}
          onSelect={flow.selectType}
          onContinue={flow.goToForm}
        />
      )}

      {/* STEP 2 */}
      {flow.step === "register-form" && flow.accountType === "candidate" && (
        <CandidateForm
          data={candidate.candidateForm}
          setData={candidate.setCandidateForm}
          onSubmit={handleSubmit}
          isLoading={flow.isLoading}
          error={flow.error}
        />
      )}

      {flow.step === "register-form" && flow.accountType === "company" && (
        <CompanyForm
          data={company.companyForm}
          setData={company.setCompanyForm}
          onSubmit={handleSubmit}
          isLoading={flow.isLoading}
          error={flow.error}
        />
      )}
    </RegisterLayout>
  );
}
