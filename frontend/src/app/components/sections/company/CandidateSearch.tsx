import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { ScrollArea } from "../../../components/ui/ScrollArea";
import { MapPin, Briefcase, Star, Heart, ChevronDown } from "lucide-react";

import CandidateProfileView from "./CandidateProfileView";
import { API } from "../../../../api/auth";
import { useAuth } from "../../../../context/AuthContext";

interface MatchDetail {
  companyFlag: string;
  companyFlagId: number;
  bestMatchWith: string;
  score: number;
}

interface CandidateMatch {
  candidateProfileId: number;
  candidateId: number;
  candidateName?: string | null;
  candidateHeadline?: string | null;
  candidateLocation?: string | null;
  candidateSummary?: string | null;
  candidateProfileTitle?: string | null;
  candidateRemotePreference?: string | null;
  candidateYearsExperience?: number | null;
  matchedFlagsScore: number;
  totalCompanyFlags: number;
  matchPercentage: number;
  matchingDetails: MatchDetail[];
}

interface CompanyProfileSummary {
  id: number;
  title?: string | null;
  summary?: string | null;
  location?: string | null;
  remotePreference?: string | null;
  yearsExperience?: number | null;
}

interface Candidate {
  id: string;
  candidateUserId: number;
  name: string;
  role: string;
  avatarUrl: string;
  headline: string;
  location: string;
  experience: string;
  matchScore: number;
  remotePreference: string;
  availability: string;
  summary: string;
  skills: string[];
  workExperience: Array<{
    title: string;
    company: string;
    period: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    period: string;
  }>;
  desiredRoles: string[];
  desiredIndustries: string[];
  salaryExpectation: string;
  githubUrl: string;
  portfolioUrl: string;
  linkedinUrl: string;
}

interface CandidateSearchProps {
  onInterested: (candidateId: string) => void;
  interestedIds?: string[];
}

function MatchBadge({ score }: { score: number }) {
  const color =
    score >= 90
      ? "bg-emerald-100 text-emerald-700"
      : score >= 75
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}
    >
      <Star className="size-3" />
      {score}% match
    </span>
  );
}

const getUserIdFromToken = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const id =
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      payload.nameid ||
      payload.sub ||
      payload.id;
    return id ? parseInt(id) : null;
  } catch {
    return null;
  }
};

export default function CandidateSearch({
  onInterested,
  interestedIds = [],
}: CandidateSearchProps) {
  const [profiles, setProfiles] = useState<CompanyProfileSummary[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(
    null,
  );
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [viewing, setViewing] = useState<Candidate | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const loadProfiles = async () => {
      setLoadingProfiles(true);
      setError(null);

      try {
        const response = await API.get<CompanyProfileSummary[]>("/profile/my");
        const companyProfiles = response.data ?? [];
        setProfiles(companyProfiles);
        if (companyProfiles.length > 0) {
          setSelectedProfileId(companyProfiles[0].id);
        }
      } catch (err) {
        console.error("Failed to load company profiles", err);
        setError("Unable to load your recruiting profiles. Please refresh.");
      } finally {
        setLoadingProfiles(false);
      }
    };

    void loadProfiles();
  }, []);

  useEffect(() => {
    if (!selectedProfileId) {
      setMatches([]);
      return;
    }

    const loadMatches = async () => {
      setLoadingMatches(true);
      setError(null);

      try {
        const response = await API.get<{
          searchedProfileId: number;
          totalCompanyFlags: number;
          candidatesProfileMatches: CandidateMatch[];
        }>(`/match/lookup/${selectedProfileId}`);

        const rawMatches = response.data.candidatesProfileMatches ?? [];
        console.log(
          "matchingDetails sample:",
          rawMatches[0]?.matchingDetails?.[0],
        );

        // Enrich each match with candidate user + profile data
        const enriched = await Promise.all(
          rawMatches.map(async (match) => {
            let name: string | null = null;
            let headline: string | null = null;
            let location: string | null = null;
            let summary: string | null = null;

            try {
              const userRes = await API.get(
                `/user/candidate/${match.candidateId}`,
              );
              const u = userRes.data;
              name =
                [u.firstName, u.lastName].filter(Boolean).join(" ") || null;
              headline = u.headline || null;
              location = u.location || null;
              summary = u.summary || null;
            } catch {
              // non-fatal
            }

            return {
              ...match,
              candidateName: name,
              candidateHeadline: headline,
              candidateLocation: location,
              candidateSummary: summary,
              candidateProfileTitle: null, // not accessible cross-role
              candidateRemotePreference: null,
              candidateYearsExperience: null,
              matchPercentage: (() => {
                if (!match.matchingDetails.length) return 0;

                // Take the best candidate score per company flag, then average
                const bestPerCompanyFlag = new Map<number, number>();
                match.matchingDetails.forEach((d) => {
                  const current = bestPerCompanyFlag.get(d.companyFlagId) ?? 0;
                  if (d.score > current) {
                    bestPerCompanyFlag.set(d.companyFlagId, d.score);
                  }
                });

                const scores = Array.from(bestPerCompanyFlag.values());
                return Math.round(
                  scores.reduce((sum, s) => sum + s, 0) / scores.length,
                );
              })(),
            };
          }),
        );

        setMatches(enriched);
      } catch (err) {
        console.error("Failed to load candidate matches", err);
        setError(
          "Unable to fetch candidate matches. Please check your company profile flags.",
        );
        setMatches([]);
      } finally {
        setLoadingMatches(false);
      }
    };

    void loadMatches();
  }, [selectedProfileId]);

  const handleInterested = async (candidate: Candidate) => {
    if (!token) return;
    const companyId = getUserIdFromToken(token);
    if (!companyId) return;

    try {
      await API.post("/match", {
        sourceId: companyId, // ← real company ID from JWT
        targetId: candidate.candidateUserId,
      });
      onInterested(candidate.id);
    } catch (err: any) {
      console.error("Failed to send interest:", err.response?.data);
    }
  };

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) ?? null,
    [profiles, selectedProfileId],
  );

  const candidateCards: Candidate[] = matches
    .map((match) => ({
      id: match.candidateProfileId.toString(),
      name: match.candidateName || match.candidateProfileTitle || "Candidate",
      role:
        match.candidateProfileTitle || match.candidateHeadline || "Candidate",
      avatarUrl: "",
      headline: match.candidateHeadline || match.candidateSummary || "",
      location: match.candidateLocation || "Remote",
      experience: match.candidateYearsExperience
        ? `${match.candidateYearsExperience}+ years`
        : "N/A",
      matchScore: match.matchPercentage,
      remotePreference: match.candidateRemotePreference || "Unknown",
      availability: "Open to offers",
      summary: match.candidateSummary ?? "",
      skills: match.matchingDetails
        .filter((detail) => detail.score >= 80) // only real matches
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((detail) => detail.bestMatchWith),
      workExperience: [],
      education: [],
      desiredRoles: match.candidateProfileTitle
        ? [match.candidateProfileTitle]
        : [],
      desiredIndustries: [],
      salaryExpectation: "",
      githubUrl: "",
      portfolioUrl: "",
      linkedinUrl: "",
      candidateUserId: match.candidateId,
    }))
    .sort((a, b) => b.matchScore - a.matchScore);

  if (loadingProfiles) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
        Loading recruiting profiles...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-foreground">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!profiles.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-foreground">
        <p className="font-semibold text-foreground">
          No recruiting profiles found.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a company recruiting profile to search candidates by job offer.
        </p>
      </div>
    );
  }

  if (viewing) {
    return (
      <CandidateProfileView
        candidate={viewing}
        onClose={() => setViewing(null)}
        showInterest
        isInterested={interestedIds.includes(viewing.id)}
        // CandidateProfileView button — pass it through
        onInterested={() => {
          handleInterested(viewing!);
          setViewing(null);
        }}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-background px-4 py-3">
        <p className="text-xs text-muted-foreground mb-2">
          Showing candidates matched to:
        </p>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Briefcase className="size-4 text-muted-foreground shrink-0" />
              {selectedProfile?.title || "Recruiting profile"}
              <span className="text-xs text-muted-foreground font-normal">
                {selectedProfile?.location || ""}
                {selectedProfile?.location && selectedProfile?.remotePreference
                  ? " · "
                  : ""}
                {selectedProfile?.remotePreference || ""}
              </span>
            </span>

            <ChevronDown
              className={`size-4 text-muted-foreground transition-transform shrink-0 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-background shadow-md">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => {
                    setSelectedProfileId(profile.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    profile.id === selectedProfileId ? "bg-muted/40" : ""
                  }`}
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {profile.title || "Untitled profile"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {profile.location || ""}
                      {profile.location && profile.remotePreference
                        ? " · "
                        : ""}
                      {profile.remotePreference || ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedProfile?.summary && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {selectedProfile.summary}
          </p>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="grid gap-3 p-4 lg:p-6">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              {loadingMatches
                ? "Computing matches..."
                : `${candidateCards.length} candidate${candidateCards.length !== 1 ? "s" : ""} matched`}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedProfile?.summary ||
                "Search candidates by your company profile flags."}
            </p>
          </div>

          {loadingMatches && (
            <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
              Calculating match scores based on shared flags...
            </div>
          )}

          {!loadingMatches && candidateCards.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
              No matching candidates found for this profile.
            </div>
          )}

          {candidateCards.map((candidate) => (
            <div
              key={candidate.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <Avatar className="size-11 shrink-0 border border-border">
                  <AvatarImage src={candidate.avatarUrl} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                    {candidate.name?.[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <button
                        onClick={() => setViewing(candidate)}
                        className="text-sm font-semibold text-foreground hover:text-primary transition-colors text-left"
                      >
                        {candidate.name}
                      </button>
                      <p className="text-sm text-muted-foreground">
                        {candidate.role}
                      </p>
                    </div>

                    {!!candidate.matchScore && (
                      <MatchBadge score={candidate.matchScore} />
                    )}
                  </div>

                  <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {candidate.location}
                    </span>

                    <span className="flex items-center gap-1">
                      <Briefcase className="size-3" />
                      {candidate.experience}
                    </span>

                    {candidate.remotePreference && (
                      <span>{candidate.remotePreference}</span>
                    )}
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {candidate.skills
                      ?.slice(0, 5)
                      .map((skill: string, index: number) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                        >
                          {skill}
                        </span>
                      ))}

                    {(candidate.skills?.length ?? 0) > 5 && (
                      <span className="text-xs text-muted-foreground self-center">
                        +{candidate.skills!.length - 5} more
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewing(candidate)}
                    >
                      View Full Profile
                    </Button>

                    <Button
                      size="sm"
                      variant={
                        interestedIds.includes(candidate.id)
                          ? "secondary"
                          : "default"
                      }
                      // "Interested" button
                      onClick={() => handleInterested(candidate)}
                      disabled={interestedIds.includes(candidate.id)}
                    >
                      <Heart
                        className={`size-4 ${
                          interestedIds.includes(candidate.id)
                            ? "fill-current"
                            : ""
                        }`}
                      />
                      {interestedIds.includes(candidate.id)
                        ? "Interested"
                        : "Interested"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
