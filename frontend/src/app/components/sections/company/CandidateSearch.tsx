import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { ScrollArea } from "../../../components/ui/ScrollArea";
import { MapPin, Briefcase, Star, Heart, ChevronDown } from "lucide-react";

import CandidateProfileView from "./CandidateProfileView";

interface Candidate {
  id: string;
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

interface JobOffer {
  id: string;
  title: string;
  seniority: string;
  remote: string;
  skills: string[];
  candidates: Candidate[];
}

const mockJobOffers: JobOffer[] = [
  {
    id: "rp1",
    title: "Senior Frontend Engineer",
    seniority: "Senior",
    remote: "Hybrid",
    skills: ["React", "TypeScript", "GraphQL", "Tailwind CSS"],
    candidates: [
      {
        id: "c1",
        name: "Alex Johnson",
        role: "Senior Frontend Engineer",
        avatarUrl: "",
        headline: "Building scalable web apps with React & TypeScript",
        location: "San Francisco, CA",
        experience: "5+ years",
        matchScore: 94,
        remotePreference: "Hybrid",
        availability: "Open to offers",
        summary:
          "Passionate software engineer with 5+ years building modern web applications.",
        skills: ["React", "TypeScript", "Node.js", "GraphQL", "Tailwind CSS"],
        workExperience: [
          {
            title: "Senior Frontend Engineer",
            company: "Acme Corp",
            period: "2021 – Present",
            description:
              "Led frontend architecture for a SaaS platform serving 50k+ users.",
          },
        ],
        education: [
          {
            degree: "B.Sc. Computer Science",
            school: "UC Berkeley",
            period: "2015 – 2019",
          },
        ],
        desiredRoles: ["Senior Frontend Engineer", "Tech Lead"],
        desiredIndustries: ["SaaS", "FinTech"],
        salaryExpectation: "$160k – $200k",
        githubUrl: "https://github.com/alexjohnson",
        portfolioUrl: "https://alexjohnson.dev",
        linkedinUrl: "https://linkedin.com/in/alexjohnson",
      },
    ],
  },
  {
    id: "rp2",
    title: "Full Stack Developer",
    seniority: "Mid-level",
    remote: "Remote only",
    skills: ["Node.js", "Python", "React", "PostgreSQL"],
    candidates: [],
  },
];

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

interface CandidateSearchProps {
  onInterested: (candidateId: string) => void;
  interestedIds?: string[];
}

export default function CandidateSearch({
  onInterested,
  interestedIds = [],
}: CandidateSearchProps) {
  const [selectedOfferId, setSelectedOfferId] = useState<string>(
    mockJobOffers[0].id,
  );
  const [viewing, setViewing] = useState<Candidate | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const selectedOffer = mockJobOffers.find(
    (offer) => offer.id === selectedOfferId,
  );

  const candidates = [...(selectedOffer?.candidates ?? [])].sort(
    (a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0),
  );

  if (viewing) {
    return (
      <CandidateProfileView
        candidate={viewing}
        onClose={() => setViewing(null)}
        showInterest
        isInterested={interestedIds.includes(viewing.id)}
        onInterested={() => {
          onInterested(viewing.id);
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
              {selectedOffer?.title}
              <span className="text-xs text-muted-foreground font-normal">
                · {selectedOffer?.seniority} · {selectedOffer?.remote}
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
              {mockJobOffers.map((offer: JobOffer) => (
                <button
                  key={offer.id}
                  onClick={() => {
                    setSelectedOfferId(offer.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    offer.id === selectedOfferId ? "bg-muted/40" : ""
                  }`}
                >
                  <div>
                    <p className="font-medium text-foreground">{offer.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {offer.seniority} · {offer.remote} ·{" "}
                      {offer.candidates.length} match
                      {offer.candidates.length !== 1 ? "es" : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedOffer?.skills.map((skill: string) => (
            <span
              key={skill}
              className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="grid gap-3 p-4 lg:p-6">
          <p className="text-xs text-muted-foreground">
            {candidates.length} candidate
            {candidates.length !== 1 ? "s" : ""} matched
          </p>

          {candidates.map((candidate: Candidate) => (
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
                    {candidate.skills?.slice(0, 5).map((skill: string) => (
                      <span
                        key={skill}
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
                      onClick={() => onInterested(candidate.id)}
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
