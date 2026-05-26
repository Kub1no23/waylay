import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OnboardingPage() {
  const navigate = useNavigate();

  const [candidateProfile, setCandidateProfile] = useState<ProfileData>({
    title: "",
    summary: "",
    location: "",
    remotePreference: "hybrid",
    yearsExperience: "",
  });

  const [companyProfile, setCompanyProfile] = useState<ProfileData>({
    title: "",
    summary: "",
    location: "",
    remotePreference: "hybrid",
    yearsExperience: "",
  });
  const [createJobProfile, setCreateJobProfile] = useState<boolean | null>(
    null,
  );

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
    navigate("/login");
  };

  const handleCompanyOnboardingChoice = async (choice: boolean) => {
    setCreateJobProfile(choice);

    if (!choice) {
      // Skip profile creation, go to dashboard
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate("/login");
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
    navigate("/login");
  };

  return <></>;
}
