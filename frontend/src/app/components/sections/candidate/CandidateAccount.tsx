"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { API } from "../../../../api/auth";
import { Button } from "../../../components/ui/Button";
import { Save, Loader2, Check } from "lucide-react";
import type { CandidateFormData } from "../../../../libs/types";

// This single line copies CandidateFormData and strips the password fields.
type CandidateProfileState = Omit<
  CandidateFormData,
  "password" | "confirmPassword"
>;

// Helper function to extract the User ID from a standard ASP.NET Core JWT Token
const getUserIdFromToken = (token: string): string | null => {
  try {
    const payloadBase64 = token.split(".")[1];
    const decodedJson = atob(payloadBase64);
    const payload = JSON.parse(decodedJson);

    return (
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      payload.nameid ||
      payload.sub ||
      payload.id
    );
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
};

export default function CandidateAccount() {
  const { token } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [formData, setFormData] = useState<CandidateProfileState>({
    email: "",
    firstName: "",
    lastName: "",
    location: "",
    headline: "",
    summary: "",
    githubUrl: "",
    portfolioUrl: "",
  });

  // 1. Initial Load: Fetch existing account data
  useEffect(() => {
    async function fetchProfileData() {
      if (!token) return;

      const userId = getUserIdFromToken(token);
      if (!userId) {
        setErrorMessage("Could not verify user identity from token.");
        return;
      }

      setLoading(true);
      try {
        const response = await API.get(`/user/candidate/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;

        setFormData({
          email: data.email || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          location: data.location || "",
          headline: data.headline || "",
          summary: data.summary || "",
          githubUrl: data.githubUrl || "",
          portfolioUrl: data.portfolioUrl || "",
        });
      } catch (err: any) {
        console.error("Error loading account data:", err);
        const serverMsg =
          err.response?.data || "An error occurred fetching profile.";
        setErrorMessage(
          typeof serverMsg === "string"
            ? serverMsg
            : "Failed to load account details.",
        );
      } finally {
        setLoading(false);
      }
    }
    fetchProfileData();
  }, [token]);

  // 2. Save Changes: Explicitly map payload to guarantee fields are never dropped
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    // DEFENSIVE FIX: Explicitly enforce that empty fields are sent as ""
    // instead of letting JS accidentally omit them or turn them into undefined
    const explicitPayload = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      location: formData.location || null,
      headline: formData.headline || null,
      summary: formData.summary || null,
      githubUrl: formData.githubUrl || null,
      portfolioUrl: formData.portfolioUrl || null,
    };

    try {
      await API.put("/user/candidate", explicitPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving account details:", err);
      const serverMsg = err.response?.data?.errors
        ? "Validation failed. Please ensure all required fields are valid."
        : err.response?.data || "Server error occurred while saving.";
      setErrorMessage(
        typeof serverMsg === "string"
          ? serverMsg
          : "Failed to save profile information.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-2xl rounded-xl bg-card border border-border p-5 lg:p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Candidate Account
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your base identity configuration and personal developer URLs.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identity Name Row Split Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 flex items-center text-sm font-medium text-foreground"
              >
                First Name
                <span
                  className="text-destructive ml-0.5 text-xs"
                  aria-hidden="true"
                >
                  *
                </span>
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, firstName: e.target.value }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 shadow-sm"
                placeholder="John"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 flex items-center text-sm font-medium text-foreground"
              >
                Last Name
                <span
                  className="text-destructive ml-0.5 text-xs"
                  aria-hidden="true"
                >
                  *
                </span>
              </label>
              <input
                id="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, lastName: e.target.value }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 shadow-sm"
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Location Input */}
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
              value={formData.location}
              onChange={(e) =>
                setFormData((p) => ({ ...p, location: e.target.value }))
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 shadow-sm"
              placeholder="e.g., Prague, CZ"
            />
          </div>

          {/* Headline Input */}
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
              value={formData.headline}
              onChange={(e) =>
                setFormData((p) => ({ ...p, headline: e.target.value }))
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 shadow-sm"
              placeholder="e.g., Backend Engineer specialized in Distributed Engines"
            />
          </div>

          {/* Summary Input */}
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
              value={formData.summary}
              onChange={(e) =>
                setFormData((p) => ({ ...p, summary: e.target.value }))
              }
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 shadow-sm"
              placeholder="Provide a short synopsis of your historical experience..."
            />
          </div>

          {/* GitHub Profile URL */}
          <div>
            <label
              htmlFor="githubUrl"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              GitHub Profile URL
            </label>
            <input
              id="githubUrl"
              type="url"
              value={formData.githubUrl}
              onChange={(e) =>
                setFormData((p) => ({ ...p, githubUrl: e.target.value }))
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 shadow-sm"
              placeholder="https://github.com/yourprofile"
            />
          </div>

          {/* Portfolio Website URL */}
          <div>
            <label
              htmlFor="portfolioUrl"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Portfolio Website URL
            </label>
            <input
              id="portfolioUrl"
              type="url"
              value={formData.portfolioUrl}
              onChange={(e) =>
                setFormData((p) => ({ ...p, portfolioUrl: e.target.value }))
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 shadow-sm"
              placeholder="https://yourportfolio.dev"
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isSaving}>
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
                Your account profile has been updated
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
