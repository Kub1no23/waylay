import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../../libs/utils";

import { registerCandidate, registerCompany } from "../../api/auth";

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
    location: "",
    headline: "",
    summary: "",
    githubUrl: "",
    portfolioUrl: "",
  });

  // Company data
  const [companyForm, setCompanyForm] = useState<CompanyFormData>({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
          location: candidateForm.location,
          headline: candidateForm.headline,
          summary: candidateForm.summary,
          githubUrl: candidateForm.githubUrl,
          portfolioUrl: candidateForm.portfolioUrl,
        });

        setStep("candidate-onboarding");
      }

      if (accountType === "company") {
        await registerCompany({
          name: companyForm.companyName,
          email: companyForm.email,
          password: companyForm.password,
          headquarters: companyForm.headquarters,
          address: companyForm.address,
          industry: companyForm.industry,
          description: companyForm.description,
        });

        setStep("company-onboarding");
      }
    } catch (err: any) {
      const data = err.response?.data;

      const message =
        data?.title ||
        data?.message ||
        (typeof data === "string" ? data : null) ||
        err.message ||
        "Registration failed";

      setError(message);
    } finally {
      setIsLoading(false);
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
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
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

                  {/* Additional Information (Optional) */}
                  <details className="group rounded-lg border border-border bg-card/50">
                    <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50">
                      <span>Additional information (optional)</span>
                      <svg
                        className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180"
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
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </summary>
                    <div className="space-y-4 border-t border-border px-4 py-4">
                      <div>
                        <label
                          htmlFor="regLocation"
                          className="mb-1.5 block text-sm font-medium text-foreground"
                        >
                          Location
                        </label>
                        <input
                          id="regLocation"
                          type="text"
                          value={candidateForm.location}
                          onChange={(e) =>
                            setCandidateForm((prev) => ({
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
                          htmlFor="regHeadline"
                          className="mb-1.5 block text-sm font-medium text-foreground"
                        >
                          Headline
                        </label>
                        <input
                          id="regHeadline"
                          type="text"
                          value={candidateForm.headline}
                          onChange={(e) =>
                            setCandidateForm((prev) => ({
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
                          htmlFor="regSummary"
                          className="mb-1.5 block text-sm font-medium text-foreground"
                        >
                          Summary
                        </label>
                        <textarea
                          id="regSummary"
                          rows={3}
                          value={candidateForm.summary}
                          onChange={(e) =>
                            setCandidateForm((prev) => ({
                              ...prev,
                              summary: e.target.value,
                            }))
                          }
                          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                          placeholder="Tell companies about your experience and what you're looking for..."
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="regGithubUrl"
                          className="mb-1.5 block text-sm font-medium text-foreground"
                        >
                          GitHub URL
                        </label>
                        <input
                          id="regGithubUrl"
                          type="url"
                          value={candidateForm.githubUrl}
                          onChange={(e) =>
                            setCandidateForm((prev) => ({
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
                          htmlFor="regPortfolioUrl"
                          className="mb-1.5 block text-sm font-medium text-foreground"
                        >
                          Portfolio URL
                        </label>
                        <input
                          id="regPortfolioUrl"
                          type="url"
                          value={candidateForm.portfolioUrl}
                          onChange={(e) =>
                            setCandidateForm((prev) => ({
                              ...prev,
                              portfolioUrl: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                          placeholder="https://yourportfolio.com"
                        />
                      </div>
                    </div>
                  </details>
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
                  {/* Additional Information (Optional) */}
                  <details className="group rounded-lg border border-border bg-card/50">
                    <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50">
                      <span>Additional information (optional)</span>
                      <svg
                        className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180"
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
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </summary>
                    <div className="space-y-4 border-t border-border px-4 py-4">
                      <div>
                        <label
                          htmlFor="regHeadquarters"
                          className="mb-1.5 block text-sm font-medium text-foreground"
                        >
                          Headquarters
                        </label>
                        <input
                          id="regHeadquarters"
                          type="text"
                          value={companyForm.headquarters}
                          onChange={(e) =>
                            setCompanyForm((prev) => ({
                              ...prev,
                              headquarters: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                          placeholder="e.g., New York, NY"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="regAddress"
                          className="mb-1.5 block text-sm font-medium text-foreground"
                        >
                          Address
                        </label>
                        <input
                          id="regAddress"
                          type="text"
                          value={companyForm.address}
                          onChange={(e) =>
                            setCompanyForm((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                          placeholder="e.g., 123 Main St, Suite 100"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="regIndustry"
                          className="mb-1.5 block text-sm font-medium text-foreground"
                        >
                          Industry
                        </label>
                        <textarea
                          id="regIndustry"
                          rows={3}
                          value={companyForm.industry}
                          onChange={(e) =>
                            setCompanyForm((prev) => ({
                              ...prev,
                              industry: e.target.value,
                            }))
                          }
                          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                          placeholder="e.g., Technology, Finance, Healthcare"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="regDescription"
                          className="mb-1.5 block text-sm font-medium text-foreground"
                        >
                          Description
                        </label>
                        <textarea
                          id="regDescription"
                          rows={3}
                          value={companyForm.description}
                          onChange={(e) =>
                            setCompanyForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                          placeholder="Describe your company, culture, and what makes you unique."
                        />
                      </div>
                    </div>
                  </details>
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
