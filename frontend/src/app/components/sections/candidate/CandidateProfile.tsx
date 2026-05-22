"use client";

import { useState } from "react";
import { Button } from "../../ui/Button";

// Icons
function SaveIcon({ className }: { className?: string }) {
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
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
      <path d="M7 3v4a1 1 0 0 0 1 1h7" />
    </svg>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
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

interface ProfileData {
  title: string;
  headline: string;
  summary: string;
  location: string;
  remotePreference: string;
  yearsExperience: string;
  githubUrl: string;
  portfolioUrl: string;
}

const initialProfile: ProfileData = {
  title: "Senior Frontend Engineer",
  headline: "Building scalable web applications with React and TypeScript",
  summary:
    "Passionate software engineer with 5+ years of experience building modern web applications. I specialize in React, TypeScript, and Node.js, with a focus on creating intuitive user experiences and maintaining clean, testable code.",
  location: "San Francisco, CA",
  remotePreference: "hybrid",
  yearsExperience: "5",
  githubUrl: "https://github.com/alexjohnson",
  portfolioUrl: "https://alexjohnson.dev",
};

export function CandidateProfile() {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(initialProfile);

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Your Profile
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This information will be visible to companies who reach out to you.
          </p>
        </div>

        <div className="space-y-6">
          {/* Professional Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Professional Title
            </label>
            <input
              id="title"
              type="text"
              value={profile.title}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="e.g., Senior Software Engineer"
            />
          </div>

          {/* Headline */}
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
              value={profile.headline}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, headline: e.target.value }))
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="A brief tagline about yourself"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              A short tagline that appears below your name
            </p>
          </div>

          {/* Summary */}
          <div>
            <label
              htmlFor="summary"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Summary
            </label>
            <textarea
              id="summary"
              rows={4}
              value={profile.summary}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, summary: e.target.value }))
              }
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="Tell companies about your experience and what you're looking for..."
            />
          </div>

          {/* Location */}
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
              value={profile.location}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, location: e.target.value }))
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="e.g., San Francisco, CA"
            />
          </div>

          {/* Remote Preference */}
          <div>
            <label
              htmlFor="remotePreference"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Work Preference
            </label>
            <select
              id="remotePreference"
              value={profile.remotePreference}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  remotePreference: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            >
              <option value="remote">Remote only</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          {/* Years of Experience */}
          <div>
            <label
              htmlFor="yearsExperience"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Years of Experience
            </label>
            <select
              id="yearsExperience"
              value={profile.yearsExperience}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  yearsExperience: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            >
              <option value="0-1">0-1 years</option>
              <option value="1-3">1-3 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5">5+ years</option>
              <option value="10">10+ years</option>
            </select>
          </div>

          {/* GitHub URL */}
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
              value={profile.githubUrl}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, githubUrl: e.target.value }))
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="https://github.com/username"
            />
          </div>

          {/* Portfolio URL */}
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
              value={profile.portfolioUrl}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  portfolioUrl: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="https://yourportfolio.com"
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3 pt-4">
            <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
              {isSaving ? (
                <>
                  <LoaderIcon className="size-4" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckIcon className="size-4" />
                  Saved
                </>
              ) : (
                <>
                  <SaveIcon className="size-4" />
                  Save Changes
                </>
              )}
            </Button>
            {saveSuccess && (
              <span className="text-sm text-muted-foreground">
                Your profile has been updated
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
