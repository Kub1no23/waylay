"use client";

import { useState, useEffect } from "react";
import { API } from "../../../../api/auth"; // this path is correct do not change
import { Button } from "../../../components/ui/Button";
import { Save, Loader2, Search, X, Check } from "lucide-react";

interface FlagItem {
  id: number;
  name: string;
  category?: string;
}

interface ProfileData {
  id?: number;
  title: string;
  headline: string;
  summary: string;
  location: string;
  remotePreference: string;
  yearsExperience: number;
  isActive: boolean;
  flags: FlagItem[];
}

const initialProfile: ProfileData = {
  title: "",
  headline: "",
  summary: "",
  location: "",
  remotePreference: "Hybrid",
  yearsExperience: 0,
  isActive: true,
  flags: [],
};

export default function CandidateJobProfile() {
  const [serverProfile, setServerProfile] =
    useState<ProfileData>(initialProfile);
  const [profile, setProfile] = useState<ProfileData>(initialProfile);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Search & Debounce States for system flags
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<FlagItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 1. Initial Load: Fetch existing profile data (Includes user flags)
  // 1. Initial Load: Fetch existing profile data AND merge flag assignments
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await API.get("/profile/my");

        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const activeProfile = res.data[0];
          let profileFlags: FlagItem[] = activeProfile.flags || [];

          // BACKEND SYNC PATCH: If flags aren't loaded automatically by the profile model route,
          // pull them directly from the flags database context using your profile's unique ID
          if (activeProfile.id && profileFlags.length === 0) {
            try {
              // Hits search targeting only flags currently bound to your specific profile
              const flagRes = await API.get(`/flag`, {
                params: { profileId: activeProfile.id, page: 1 },
              });
              if (flagRes.data && flagRes.data.data) {
                profileFlags = flagRes.data.data;
              }
            } catch (flagErr) {
              console.warn(
                "Could not lazily pull assigned profile flags:",
                flagErr,
              );
            }
          }

          const fetchedData: ProfileData = {
            id: activeProfile.id,
            title: activeProfile.title || "",
            headline: activeProfile.headline || "",
            summary: activeProfile.summary || "",
            location: activeProfile.location || "",
            remotePreference: activeProfile.remotePreference || "Hybrid",
            yearsExperience: Number(activeProfile.yearsExperience) || 0,
            isActive: activeProfile.isActive ?? true,
            flags: profileFlags, // Safely mapped to your UI state
          };

          setServerProfile(fetchedData);
          setProfile(fetchedData);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setErrorMessage("Failed to load profile data from server.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // 2. Debounced Automatic Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await API.get(`/flag`, {
          params: { q: searchQuery, page: 1 },
        });

        const filtered = (res.data.data || []).filter(
          (suggested: FlagItem) =>
            !profile.flags.some((f) => f.id === suggested.id),
        );
        setSuggestions(filtered);
      } catch (err) {
        console.error("Error fetching autofill tags:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, profile.flags]);

  const selectSuggestion = (flag: FlagItem) => {
    setProfile((prev) => ({
      ...prev,
      flags: [...prev.flags, flag],
    }));
    setSearchQuery("");
    setSuggestions([]);
  };

  const removeFlag = (flagId: number) => {
    setProfile((prev) => ({
      ...prev,
      flags: prev.flags.filter((f) => f.id !== flagId),
    }));
  };

  // 3. Active Save Execution with Custom Flag Transaction Reconciliation
  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    try {
      let savedProfile: ProfileData;

      if (profile.id) {
        // Step A: Update baseline profile table values
        const res = await API.put(`/profile/${profile.id}`, {
          title: profile.title,
          headline: profile.headline,
          summary: profile.summary,
          location: profile.location,
          remotePreference: profile.remotePreference,
          yearsExperience: profile.yearsExperience,
          isActive: true,
        });
        savedProfile = res.data.profile || res.data;

        // Step B: Calculate original state differences for flag syncing
        const originalFlags = serverProfile.flags || [];

        const flagsToRemove = originalFlags
          .filter((orig) => !profile.flags.some((f) => f.id === orig.id))
          .map((f) => f.id);

        const flagsToAdd = profile.flags.filter(
          (f) => !originalFlags.some((orig) => orig.id === f.id),
        );

        // Step C: Dispatch delete payload to database context if removals exist
        if (flagsToRemove.length > 0) {
          await API.delete(`/profile/${profile.id}/flag`, {
            data: { flagIds: flagsToRemove },
          });
        }

        // Step D: Dispatch structured Record dictionary weight values for additions
        if (flagsToAdd.length > 0) {
          const flagPayload: Record<number, number> = {};
          flagsToAdd.forEach((f) => {
            flagPayload[f.id] = 1.0; // Sets required Weight DTO field matching backend default
          });
          await API.post(`/profile/${profile.id}/flag`, { flags: flagPayload });
        }

        savedProfile.flags = profile.flags || [];
      } else {
        // Handle fallback initialization if user profile record doesn't exist yet
        const res = await API.post("/profile", {
          title: profile.title,
          headline: profile.headline,
          summary: profile.summary,
          location: profile.location,
          remotePreference: profile.remotePreference,
          yearsExperience: profile.yearsExperience,
        });
        savedProfile = res.data.profile || res.data;

        if (profile.flags.length > 0 && savedProfile.id) {
          const flagPayload: Record<number, number> = {};
          profile.flags.forEach((f) => {
            flagPayload[f.id] = 1.0;
          });
          await API.post(`/profile/${savedProfile.id}/flag`, {
            flags: flagPayload,
          });
        }
        savedProfile.flags = profile.flags || [];
      }

      // Re-normalize layout model constraints safely
      const normalized: ProfileData = {
        ...savedProfile,
        yearsExperience: Number(savedProfile.yearsExperience) || 0,
      };

      setServerProfile(normalized);
      setProfile(normalized);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving profile details:", err);
      const serverMsg =
        err.response?.data?.title ||
        "An error occurred while communicating with the backend.";
      setErrorMessage(serverMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(serverProfile);

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        {/* keep at min-h-100 */}
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-2xl rounded-xl bg-card border border-border p-5 lg:p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Your Profile
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This information will be used to match you with relevant job
            opportunities.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        <div className="space-y-5">
          {/* Professional Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-foreground"
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
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 shadow-sm"
              placeholder="e.g., Senior Software Engineer"
            />
          </div>

          {/* Headline */}
          <div>
            <label
              htmlFor="headline"
              className="mb-2 block text-sm font-medium text-foreground"
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
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 shadow-sm"
              placeholder="e.g., Building scalable web applications with React and TypeScript"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              A short tagline that appears below your name
            </p>
          </div>

          {/* Summary */}
          <div>
            <label
              htmlFor="summary"
              className="mb-2 block text-sm font-medium text-foreground"
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
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 shadow-sm"
              placeholder="e.g., Passionate software engineer with 5+ years of experience..."
            />
          </div>

          {/* Location and Remote Preference */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium text-foreground"
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
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 shadow-sm"
                placeholder="e.g., San Francisco, CA"
              />
            </div>

            <div>
              <label
                htmlFor="remotePreference"
                className="mb-2 block text-sm font-medium text-foreground"
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
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 text-foreground shadow-sm"
              >
                {["Remote", "Hybrid", "Onsite"].map((policy) => (
                  <option key={policy} value={policy}>
                    {policy}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Years of Experience Input Box matched exactly to recruiting side */}
          <div>
            <label
              htmlFor="yearsExperience"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Years of Experience
            </label>
            <input
              id="yearsExperience"
              type="number"
              value={profile.yearsExperience}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  yearsExperience: parseInt(e.target.value, 10) || 0,
                }))
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 shadow-sm"
              min="0"
            />
          </div>

          {/* System Flags Autofill Component */}
          <div className="relative">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Skills & Characteristics Flags
            </label>
            <div className="relative flex items-center">
              <Search className="absolute left-3 size-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-input bg-background pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 shadow-sm"
                placeholder="Type a skill or trait to add system matching criteria..."
              />
              {isSearching && (
                <Loader2 className="absolute right-3 size-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Suggestions Overlay Dropdown */}
            {suggestions.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-popover py-1 shadow-lg">
                {suggestions.map((flag) => (
                  <li key={flag.id}>
                    <button
                      type="button"
                      onClick={() => selectSuggestion(flag)}
                      className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground flex justify-between items-center"
                    >
                      <span>{flag.name}</span>
                      {flag.category && (
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {flag.category}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Rendered Selected Badges */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.flags.map((flag) => (
                <span
                  key={flag.id}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground shadow-sm"
                >
                  {flag.name}
                  <button
                    type="button"
                    onClick={() => removeFlag(flag.id)}
                    className="text-muted-foreground hover:text-foreground inline-flex items-center"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="size-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="size-4" />
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
