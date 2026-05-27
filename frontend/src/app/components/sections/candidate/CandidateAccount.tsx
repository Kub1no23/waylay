"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";

interface CandidateProfileState {
  firstName: string;
  lastName: string;
  location: string;
  headline: string;
  summary: string;
  githubUrl: string;
  portfolioUrl: string;
}

export default function CandidateAccount() {
  const { token } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState<CandidateProfileState>({
    firstName: "",
    lastName: "",
    location: "",
    headline: "",
    summary: "",
    githubUrl: "",
    portfolioUrl: "",
  });

  // Fetch data on mount
  useEffect(() => {
    async function fetchProfileData() {
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetch("/api/candidate/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            location: data.location || "",
            headline: data.headline || "",
            summary: data.summary || "",
            githubUrl: data.githubUrl || "",
            portfolioUrl: data.portfolioUrl || "",
          });
        } else {
          setMessage({
            type: "error",
            text: "Failed to load account details.",
          });
        }
      } catch (err) {
        console.error(err);
        setMessage({
          type: "error",
          text: "An error occurred fetching profile.",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchProfileData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/candidate/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Account profile updated successfully!",
        });
      } else {
        setMessage({
          type: "error",
          text: "Failed to save profile information.",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Server error occurred while saving.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Loading account settings...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Candidate Account
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage your base identity configuration and personal developer URLs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div
            className={`rounded-lg p-3 text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              First Name
            </label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
              value={formData.firstName}
              onChange={(e) =>
                setFormData((p) => ({ ...p, firstName: e.target.value }))
              }
              placeholder="John"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Last Name
            </label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
              value={formData.lastName}
              onChange={(e) =>
                setFormData((p) => ({ ...p, lastName: e.target.value }))
              }
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Location
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
            value={formData.location}
            onChange={(e) =>
              setFormData((p) => ({ ...p, location: e.target.value }))
            }
            placeholder="e.g., Prague, CZ"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Headline
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
            value={formData.headline}
            onChange={(e) =>
              setFormData((p) => ({ ...p, headline: e.target.value }))
            }
            placeholder="e.g., Backend Engineer specialized in Distributed Engines"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Summary
          </label>
          <textarea
            rows={4}
            className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
            value={formData.summary}
            onChange={(e) =>
              setFormData((p) => ({ ...p, summary: e.target.value }))
            }
            placeholder="Provide a short synopsis of your historical experience..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            GitHub Profile URL
          </label>
          <input
            type="url"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
            value={formData.githubUrl}
            onChange={(e) =>
              setFormData((p) => ({ ...p, githubUrl: e.target.value }))
            }
            placeholder="https://github.com/yourprofile"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Portfolio Website URL
          </label>
          <input
            type="url"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
            value={formData.portfolioUrl}
            onChange={(e) =>
              setFormData((p) => ({ ...p, portfolioUrl: e.target.value }))
            }
            placeholder="https://yourportfolio.dev"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
