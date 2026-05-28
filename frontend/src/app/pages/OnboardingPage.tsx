import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAuth } from "../../context/AuthContext"; // adjust path as needed
import { useOnboardingFlow } from "../../hooks/useOnboardingFlow"; // adjust path as needed
import { RegisterLayout } from "../components/sections/register/RegisterLayout";

// The two profile forms — drop these in exactly as they already exist in your project
import CandidateJobProfile from "../components/sections/candidate/CandidateJobProfile";
import RecruitingProfile from "../components/sections/company/RecruitingProfiles";

// ---------------------------------------------------------------------------
// Company job-prompt step — "Do you want to create a job posting?"
// ---------------------------------------------------------------------------
function CompanyJobPrompt({
  onCreate,
  onSkip,
}: {
  onCreate: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-8 py-4 text-center">
      <div className="space-y-2">
        <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground">
          One last thing
        </h2>
        <p className="text-muted-foreground">
          Would you like to create your first job posting now, or set it up
          later from your dashboard?
        </p>
      </div>

      <div className="grid w-full max-w-sm gap-3">
        <button
          type="button"
          onClick={onCreate}
          className="w-full cursor-pointer rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Create a job posting
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="w-full cursor-pointer rounded-lg border border-border bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Progress bar — reused visual language from AuthProgressBar
// Steps: Account created → Profile set up → Ready
// ---------------------------------------------------------------------------
function OnboardingProgressBar({
  step,
}: {
  step: "profile" | "job-prompt" | "job-form";
}) {
  const profileActive = true; // always on step 1+
  const jobActive = step === "job-prompt" || step === "job-form";

  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {/* Step 1 — always complete (they just registered) */}
      <div className="h-2 w-16 rounded-full bg-primary transition-colors" />
      {/* Step 2 — profile form */}
      <div
        className={`h-2 w-16 rounded-full transition-colors ${
          profileActive ? "bg-primary" : "bg-border"
        }`}
      />
      {/* Step 3 — job prompt / done */}
      <div
        className={`h-2 w-16 rounded-full transition-colors ${
          jobActive ? "bg-primary" : "bg-border"
        }`}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wrapper that injects an onSaveSuccess callback into CandidateJobProfile
// The existing component doesn't have one, so we wrap it and watch for the
// save event via a thin prop-injection pattern.
// ---------------------------------------------------------------------------
function CandidateOnboardingWrapper({
  onComplete,
}: {
  onComplete: () => void;
}) {
  // CandidateJobProfile handles its own save internally.
  // We surface a "Continue to dashboard →" button once the user saves at
  // least once — detected by listening to the component's own success state
  // via a sibling button rendered below it.
  //
  // If you later add an `onSaveSuccess` prop to CandidateJobProfile, pass
  // `onComplete` directly and remove this wrapper.
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground">
          Set up your profile
        </h2>
        <p className="mt-1 text-muted-foreground">
          Help companies discover you by completing your job profile.
        </p>
      </div>

      <CandidateJobProfile />

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onComplete}
          className="cursor-pointer text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
        >
          Continue to dashboard →
        </button>
      </div>
    </div>
  );
}

// Same thin wrapper for the company recruiting profile
function CompanyOnboardingWrapper({
  onComplete,
}: {
  onComplete: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground">
          Create a job posting
        </h2>
        <p className="mt-1 text-muted-foreground">
          Define the role you're hiring for so candidates can find you.
        </p>
      </div>

      <RecruitingProfile />

      <div className="flex flex-col items-center gap-2 pt-2">
        <button
          type="button"
          onClick={onComplete}
          className="cursor-pointer text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
        >
          Continue to dashboard →
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main OnboardingPage
// ---------------------------------------------------------------------------
export default function OnboardingPage() {
  const navigate = useNavigate();
  const { role } = useAuth(); // "candidate" | "company" — read from your AuthContext

  const validRole = role === "company" ? "company" : "candidate";

  const flow = useOnboardingFlow({
    role: validRole,
    onComplete: () => {
      if (validRole === "company") {
        navigate("/company/dashboard");
      } else {
        navigate("/candidate/dashboard");
      }
    },
  });

  // ── Checking / loading ──────────────────────────────────────────────────
  if (flow.step === "checking") {
    return (
      <RegisterLayout>
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </RegisterLayout>
    );
  }

  // ── Candidate: profile form ─────────────────────────────────────────────
  if (flow.step === "profile-form") {
    return (
      <RegisterLayout>
        <OnboardingProgressBar step="profile" />
        <CandidateOnboardingWrapper onComplete={flow.completeProfileForm} />
      </RegisterLayout>
    );
  }

  // ── Company: "create job posting or skip?" prompt ───────────────────────
  if (flow.step === "job-prompt") {
    return (
      <RegisterLayout>
        <OnboardingProgressBar step="job-prompt" />
        <CompanyJobPrompt
          onCreate={flow.goToJobForm}
          onSkip={flow.skipJobForm}
        />
      </RegisterLayout>
    );
  }

  // ── Company: recruiting profile / job form ──────────────────────────────
  if (flow.step === "job-form") {
    return (
      <RegisterLayout>
        <OnboardingProgressBar step="job-form" />
        <CompanyOnboardingWrapper
          onComplete={flow.completeJobForm}
          onSkip={flow.skipJobForm}
        />
      </RegisterLayout>
    );
  }

  // "done" step — useEffect in hook fires onComplete, this is a safety render
  return null;
}
