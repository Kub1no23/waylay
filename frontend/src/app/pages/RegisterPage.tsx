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

      if (flow.accountType === "candidate") {
        await registerCandidate(candidate.candidateForm);
      } else {
        await registerCompany(company.companyForm);
      }

      navigate("/login", {
        state: {
          email:
            flow.accountType === "candidate"
              ? candidate.candidateForm.email
              : company.companyForm.email,
        },
      });
    } catch (e) {
      flow.setError("Registration failed");
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
