import { useState, useEffect } from "react";
import { API } from "../api/auth"; // adjust path to match your project

export type OnboardingStep =
  | "checking"       // loading — figuring out what to show
  | "profile-form"   // candidate: fill CandidateJobProfile
  | "job-prompt"     // company: "create a job posting or skip?"
  | "job-form"       // company: fill RecruitingProfile
  | "done";          // redirect to dashboard

export type OnboardingRole = "candidate" | "company";

interface UseOnboardingFlowOptions {
  role: OnboardingRole;
  /** Called when onboarding is complete — navigate to dashboard here */
  onComplete: () => void;
}

export function useOnboardingFlow({ role, onComplete }: UseOnboardingFlowOptions) {
  const [step, setStep] = useState<OnboardingStep>("checking");
  const [hasProfile, setHasProfile] = useState(false);

  // On mount: check if the user already has a profile
  useEffect(() => {
    async function checkProfile() {
      try {
        if (role === "candidate") {
          const res = await API.get("/profile/my");
          const exists =
            Array.isArray(res.data) && res.data.length > 0;
          setHasProfile(exists);
          setStep(exists ? "done" : "profile-form");
        } else {
          // Company: check for recruiting profile
          const res = await API.get("/recruiting-profile/my");
          const exists =
            Array.isArray(res.data) && res.data.length > 0;
          setHasProfile(exists);
          // Companies always get the prompt — even if they have a profile
          // they might want to add a job posting
          setStep(exists ? "done" : "job-prompt");
        }
      } catch {
        // If the endpoint 404s, treat it as "no profile yet"
        setStep(role === "candidate" ? "profile-form" : "job-prompt");
      }
    }

    checkProfile();
  }, [role]);

  // Called after CandidateJobProfile saves successfully
  const completeProfileForm = () => {
    setHasProfile(true);
    setStep("done");
    onComplete();
  };

  // Company chose to create a job posting
  const goToJobForm = () => setStep("job-form");

  // Company chose to skip job posting
  const skipJobForm = () => {
    setStep("done");
    onComplete();
  };

  // Called after RecruitingProfile saves successfully
  const completeJobForm = () => {
    setStep("done");
    onComplete();
  };

  // Fires whenever step transitions to "done"
  useEffect(() => {
    if (step === "done") onComplete();
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    step,
    hasProfile,
    completeProfileForm,
    goToJobForm,
    skipJobForm,
    completeJobForm,
  };
}
