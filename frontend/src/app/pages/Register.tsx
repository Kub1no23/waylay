import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../../libs/utils";

import { registerCandidate } from "../../api/auth";

type AccountType = "candidate" | "company" | null;
type Step =
  | "select-type"
  | "register-form"
  | "candidate-onboarding"
  | "company-onboarding";

// Icons
function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// Form data types
interface CandidateFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

interface CompanyFormData {
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
}

interface CandidateProfileData {
  title: string;
  summary: string;
  location: string;
  remotePreference: string;
  yearsExperience: string;
  headline: string;
  githubUrl: string;
  portfolioUrl: string;
}

interface CompanyProfileData {
  title: string;
  summary: string;
  location: string;
  remotePreference: string;
  yearsExperience: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("select-type");
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Candidate data
  const [candidateForm, setCandidateForm] = useState<CandidateFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [candidateProfile, setCandidateProfile] =
    useState<CandidateProfileData>({
      title: "",
      summary: "",
      location: "",
      remotePreference: "hybrid",
      yearsExperience: "",
      headline: "",
      githubUrl: "",
      portfolioUrl: "",
    });

  // Company data
  const [companyForm, setCompanyForm] = useState<CompanyFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
  });
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileData>({
    title: "",
    summary: "",
    location: "",
    remotePreference: "hybrid",
    yearsExperience: "",
  });
  const [createJobProfile, setCreateJobProfile] = useState<boolean | null>(
    null,
  );

  // Validation
  const validateCandidateForm = (): string | null => {
    if (!candidateForm.email) return "Email is required";
    if (!candidateForm.email.includes("@")) return "Please enter a valid email";
    if (!candidateForm.password) return "Password is required";
    if (candidateForm.password.length < 8)
      return "Password must be at least 8 characters";
    if (candidateForm.password !== candidateForm.confirmPassword)
      return "Passwords do not match";
    if (!candidateForm.firstName) return "First name is required";
    if (!candidateForm.lastName) return "Last name is required";
    return null;
  };

  const validateCompanyForm = (): string | null => {
    if (!companyForm.email) return "Email is required";
    if (!companyForm.email.includes("@")) return "Please enter a valid email";
    if (!companyForm.password) return "Password is required";
    if (companyForm.password.length < 8)
      return "Password must be at least 8 characters";
    if (companyForm.password !== companyForm.confirmPassword)
      return "Passwords do not match";
    if (!companyForm.companyName) return "Company name is required";
    return null;
  };

  const validateCandidateProfile = (): string | null => {
    if (!candidateProfile.title) return "Professional title is required";
    if (!candidateProfile.summary) return "Summary is required";
    return null;
  };

  const validateCompanyProfile = (): string | null => {
    if (!companyProfile.title) return "Job title is required";
    if (!companyProfile.summary) return "Job description is required";
    return null;
  };

  // Handlers
  const handleSelectType = (type: AccountType) => {
    setAccountType(type);
    setError(null);
  };

  const handleContinueToForm = () => {
    if (accountType) {
      setStep("register-form");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError =
      accountType === "candidate"
        ? validateCandidateForm()
        : validateCompanyForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      if (accountType === "candidate") {
        await registerCandidate({
          email: candidateForm.email,
          password: candidateForm.password,
          firstName: candidateForm.firstName,
          lastName: candidateForm.lastName,

          location: candidateProfile.location || undefined,
          headline: candidateProfile.headline || undefined,
          summary: candidateProfile.summary || undefined,
          githubUrl: candidateProfile.githubUrl || undefined,
          portfolioUrl: candidateProfile.portfolioUrl || undefined,
        });

        setStep("candidate-onboarding");
      } else {
        // TODO: implement registerCompany
        setStep("company-onboarding");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCandidateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateCandidateProfile();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    // Simulate API call to create profile
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);

    // Registration complete - navigate to dashboard (placeholder)
    navigate("/?registered=candidate");
  };

  const handleCompanyOnboardingChoice = async (choice: boolean) => {
    setCreateJobProfile(choice);

    if (!choice) {
      // Skip profile creation, go to dashboard
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate("/?registered=company");
    }
  };

  const handleCompanyProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateCompanyProfile();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    // Simulate API call to create job search profile
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);

    // Registration complete - navigate to dashboard (placeholder)
    navigate("/?registered=company");
  };

  const handleBack = () => {
    setError(null);
    if (step === "register-form") {
      setStep("select-type");
    } else if (step === "candidate-onboarding") {
      setStep("register-form");
    } else if (step === "company-onboarding") {
      if (createJobProfile) {
        setCreateJobProfile(null);
      } else {
        setStep("register-form");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">
                  W
                </span>
              </div>
              <span className="font-sans text-xl font-bold tracking-tight text-primary">
                WayLay
              </span>
            </Link>
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div
              className={cn(
                "h-2 w-16 rounded-full transition-colors",
                step !== "select-type" ? "bg-primary" : "bg-primary/30",
              )}
            />
            <div
              className={cn(
                "h-2 w-16 rounded-full transition-colors",
                step === "candidate-onboarding" || step === "company-onboarding"
                  ? "bg-primary"
                  : "bg-border",
              )}
            />
            <div
              className={cn(
                "h-2 w-16 rounded-full transition-colors",
                step === "company-onboarding" && createJobProfile !== null
                  ? "bg-primary"
                  : "bg-border",
              )}
            />
          </div>
        </div>

        {/* Step: Select Account Type */}
        {step === "select-type" && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">
                Create your account
              </h1>
              <p className="mt-2 text-muted-foreground">
                Choose how you want to use WayLay
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Candidate Option */}
              <button
                type="button"
                onClick={() => handleSelectType("candidate")}
                className={cn(
                  "group relative flex flex-col items-center gap-4 rounded-xl border-2 p-6 text-left transition-all hover:border-primary/50 hover:bg-card",
                  accountType === "candidate"
                    ? "border-primary bg-card shadow-sm"
                    : "border-border bg-background",
                )}
              >
                {accountType === "candidate" && (
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <CheckIcon className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-xl transition-colors",
                    accountType === "candidate"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground group-hover:bg-primary/10",
                  )}
                >
                  <UserIcon className="h-7 w-7" />
                </div>
                <div className="text-center">
                  <h3 className="font-sans text-lg font-semibold text-foreground">
                    I&apos;m a Candidate
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create a profile about yourself and let companies discover
                    you
                  </p>
                </div>
              </button>

              {/* Company Option */}
              <button
                type="button"
                onClick={() => handleSelectType("company")}
                className={cn(
                  "group relative flex flex-col items-center gap-4 rounded-xl border-2 p-6 text-left transition-all hover:border-primary/50 hover:bg-card",
                  accountType === "company"
                    ? "border-primary bg-card shadow-sm"
                    : "border-border bg-background",
                )}
              >
                {accountType === "company" && (
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <CheckIcon className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-xl transition-colors",
                    accountType === "company"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground group-hover:bg-primary/10",
                  )}
                >
                  <BuildingIcon className="h-7 w-7" />
                </div>
                <div className="text-center">
                  <h3 className="font-sans text-lg font-semibold text-foreground">
                    I&apos;m a Company
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Search for candidates and find the perfect match for your
                    roles
                  </p>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={handleContinueToForm}
              disabled={!accountType}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors",
                accountType
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "cursor-not-allowed bg-muted text-muted-foreground",
              )}
            >
              Continue
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step: Registration Form */}
        {step === "register-form" && (
          <div className="space-y-6">
            <div>
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </button>
            </div>

            <div className="text-center">
              <div
                className={cn(
                  "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl",
                  "bg-primary text-primary-foreground",
                )}
              >
                {accountType === "candidate" ? (
                  <UserIcon className="h-6 w-6" />
                ) : (
                  <BuildingIcon className="h-6 w-6" />
                )}
              </div>
              <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
                {accountType === "candidate"
                  ? "Create your candidate account"
                  : "Create your company account"}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {accountType === "candidate"
                  ? "Start building your profile and get discovered by companies"
                  : "Set up your company to start finding top talent"}
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {accountType === "candidate" ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                      >
                        First name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={candidateForm.firstName}
                        onChange={(e) =>
                          setCandidateForm((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                      >
                        Last name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={candidateForm.lastName}
                        onChange={(e) =>
                          setCandidateForm((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        placeholder="Smith"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={candidateForm.email}
                      onChange={(e) =>
                        setCandidateForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={candidateForm.password}
                      onChange={(e) =>
                        setCandidateForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      placeholder="At least 8 characters"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Confirm password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={candidateForm.confirmPassword}
                      onChange={(e) =>
                        setCandidateForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      placeholder="Confirm your password"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="companyName"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Company name
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      value={companyForm.companyName}
                      onChange={(e) =>
                        setCompanyForm((prev) => ({
                          ...prev,
                          companyName: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      placeholder="Acme Inc."
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="companyEmail"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Work email
                    </label>
                    <input
                      id="companyEmail"
                      type="email"
                      value={companyForm.email}
                      onChange={(e) =>
                        setCompanyForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      placeholder="hr@company.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="companyPassword"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Password
                    </label>
                    <input
                      id="companyPassword"
                      type="password"
                      value={companyForm.password}
                      onChange={(e) =>
                        setCompanyForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      placeholder="At least 8 characters"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="companyConfirmPassword"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Confirm password
                    </label>
                    <input
                      id="companyConfirmPassword"
                      type="password"
                      value={companyForm.confirmPassword}
                      onChange={(e) =>
                        setCompanyForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      placeholder="Confirm your password"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <LoaderIcon className="h-4 w-4" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRightIcon className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              By creating an account, you agree to our{" "}
              <a href="#" className="underline hover:text-foreground">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline hover:text-foreground">
                Privacy Policy
              </a>
            </p>
          </div>
        )}

        {/* Step: Candidate Onboarding (Profile Creation) */}
        {step === "candidate-onboarding" && (
          <div className="space-y-6">
            <div>
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </button>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <CheckIcon className="h-6 w-6" />
              </div>
              <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
                Account created! Now let&apos;s build your profile
              </h1>
              <p className="mt-2 text-muted-foreground">
                Companies will use this to find and match with you. Make it
                stand out!
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleCandidateProfileSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="profileTitle"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Professional title <span className="text-destructive">*</span>
                </label>
                <input
                  id="profileTitle"
                  type="text"
                  value={candidateProfile.title}
                  onChange={(e) =>
                    setCandidateProfile((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div>
                <label
                  htmlFor="headline"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Headline
                </label>
                <input
                  id="headline"
                  type="text"
                  value={candidateProfile.headline}
                  onChange={(e) =>
                    setCandidateProfile((prev) => ({
                      ...prev,
                      headline: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="e.g., Building scalable systems at Fortune 500 companies"
                />
              </div>

              <div>
                <label
                  htmlFor="profileSummary"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  About you <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="profileSummary"
                  rows={4}
                  value={candidateProfile.summary}
                  onChange={(e) =>
                    setCandidateProfile((prev) => ({
                      ...prev,
                      summary: e.target.value,
                    }))
                  }
                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Tell companies about your experience, skills, and what you're looking for..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="location"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={candidateProfile.location}
                    onChange={(e) =>
                      setCandidateProfile((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
                <div>
                  <label
                    htmlFor="yearsExperience"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Years of experience
                  </label>
                  <input
                    id="yearsExperience"
                    type="number"
                    min="0"
                    value={candidateProfile.yearsExperience}
                    onChange={(e) =>
                      setCandidateProfile((prev) => ({
                        ...prev,
                        yearsExperience: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    placeholder="e.g., 5"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="remotePreference"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Work preference
                </label>
                <select
                  id="remotePreference"
                  value={candidateProfile.remotePreference}
                  onChange={(e) =>
                    setCandidateProfile((prev) => ({
                      ...prev,
                      remotePreference: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="remote">Remote only</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site only</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="githubUrl"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    GitHub URL
                  </label>
                  <input
                    id="githubUrl"
                    type="url"
                    value={candidateProfile.githubUrl}
                    onChange={(e) =>
                      setCandidateProfile((prev) => ({
                        ...prev,
                        githubUrl: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <label
                    htmlFor="portfolioUrl"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Portfolio URL
                  </label>
                  <input
                    id="portfolioUrl"
                    type="url"
                    value={candidateProfile.portfolioUrl}
                    onChange={(e) =>
                      setCandidateProfile((prev) => ({
                        ...prev,
                        portfolioUrl: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <LoaderIcon className="h-4 w-4" />
                    Creating profile...
                  </>
                ) : (
                  <>
                    Complete profile
                    <ArrowRightIcon className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step: Company Onboarding */}
        {step === "company-onboarding" && (
          <div className="space-y-6">
            <div>
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </button>
            </div>

            {createJobProfile === null ? (
              // Choice screen
              <>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <CheckIcon className="h-6 w-6" />
                  </div>
                  <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
                    Account created! Ready to find talent?
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Create a job search profile to start matching with
                    candidates, or explore the platform first.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleCompanyOnboardingChoice(true)}
                    className="flex w-full items-center justify-between rounded-xl border-2 border-primary bg-card p-5 text-left transition-all hover:bg-primary/5"
                  >
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Create your first job search profile
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Define what you&apos;re looking for and start receiving
                        candidate matches
                      </p>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-primary" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCompanyOnboardingChoice(false)}
                    disabled={isLoading}
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-background p-5 text-left transition-all hover:border-muted-foreground/30 hover:bg-card"
                  >
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Skip for now
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Explore the platform first, you can create profiles
                        later
                      </p>
                    </div>
                    {isLoading ? (
                      <LoaderIcon className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ArrowRightIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </>
            ) : (
              // Job profile creation form
              <>
                <div className="text-center">
                  <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
                    Create your first job search profile
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Describe the ideal candidate you&apos;re looking for. You
                    can create multiple profiles for different roles.
                  </p>
                </div>

                {error && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <form
                  onSubmit={handleCompanyProfileSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="jobTitle"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Job title <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="jobTitle"
                      type="text"
                      value={companyProfile.title}
                      onChange={(e) =>
                        setCompanyProfile((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      placeholder="e.g., Senior Frontend Engineer"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="jobSummary"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Job description{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      id="jobSummary"
                      rows={4}
                      value={companyProfile.summary}
                      onChange={(e) =>
                        setCompanyProfile((prev) => ({
                          ...prev,
                          summary: e.target.value,
                        }))
                      }
                      className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      placeholder="Describe the role, responsibilities, and what kind of candidate you're looking for..."
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="jobLocation"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                      >
                        Location
                      </label>
                      <input
                        id="jobLocation"
                        type="text"
                        value={companyProfile.location}
                        onChange={(e) =>
                          setCompanyProfile((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        placeholder="e.g., New York, NY"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="jobYearsExperience"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                      >
                        Minimum years of experience
                      </label>
                      <input
                        id="jobYearsExperience"
                        type="number"
                        min="0"
                        value={companyProfile.yearsExperience}
                        onChange={(e) =>
                          setCompanyProfile((prev) => ({
                            ...prev,
                            yearsExperience: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        placeholder="e.g., 3"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="jobRemotePreference"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Work arrangement
                    </label>
                    <select
                      id="jobRemotePreference"
                      value={companyProfile.remotePreference}
                      onChange={(e) =>
                        setCompanyProfile((prev) => ({
                          ...prev,
                          remotePreference: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    >
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <LoaderIcon className="h-4 w-4" />
                        Creating profile...
                      </>
                    ) : (
                      <>
                        Create job profile
                        <ArrowRightIcon className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
