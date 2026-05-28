import { useState } from "react";
import type { AccountType, RegisterStep } from "../libs/types";

import type { RegisterProgressState } from "../app/utils/registerProgress";

export function useRegisterFlow() {
  const [step, setStep] = useState<RegisterStep>("select-type");
  const [accountType, setAccountType] = useState<AccountType>(null);

  const [isRegistered, setIsRegistered] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectType = (type: AccountType) => {
    setAccountType(type);
    setError(null);
  };

  const goToForm = () => {
    if (!accountType) return;

    setStep("register-form");
    setError(null);
  };

  const markRegistered = () => {
    setIsRegistered(true);
  };

  const reset = () => {
    setStep("select-type");
    setAccountType(null);
    setIsRegistered(false);
    setError(null);
    setIsLoading(false);
  };

  const progress: RegisterProgressState = {
    accountTypeSelected: accountType !== null,
    isRegistered, // ✅ wired up — was hardcoded false before
    profileCompleted: false, // handled in OnboardingPage
  };

  return {
    step,
    accountType,
    isRegistered,
    progress,
    isLoading,
    error,

    setIsLoading,
    setError,

    selectType,
    goToForm,
    markRegistered,
    reset,
  };
}
