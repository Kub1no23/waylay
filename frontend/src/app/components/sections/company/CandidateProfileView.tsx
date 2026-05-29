import { Button } from "../../../components/ui/Button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/Avatar";
import { ScrollArea } from "../../../components/ui/ScrollArea";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Heart,
  Star,
  Clock,
  GraduationCap,
  Building,
  Tag,
} from "lucide-react";

interface WorkExperience {
  title: string;
  company: string;
  period: string;
  description: string;
}

interface Education {
  degree: string;
  school: string;
  period: string;
}

interface Candidate {
  id: string;
  name: string;
  avatarUrl: string;
  headline: string;
  matchScore: number;
  availability: string;
  workExperience: WorkExperience[];
  education: Education[];
  desiredRoles: string[];
  desiredIndustries: string[];
  salaryExpectation: string;
  githubUrl: string;
  portfolioUrl: string;
  linkedinUrl: string;

  // Database Properties
  title?: string;
  role?: string; // Fallback field
  summary?: string;
  location?: string;
  remotePreference?: string;
  yearsExperience?: number;
  experience?: string | number; // Fallback field
  flags?: string[];
}

interface CandidateProfileViewProps {
  candidate: Candidate;
  onClose: () => void;
  showInterest?: boolean;
  isInterested?: boolean;
  onInterested?: () => void;
}

export default function CandidateProfileView({
  candidate,
  onClose,
  showInterest = false,
  isInterested = false,
  onInterested,
}: CandidateProfileViewProps) {
  // 1. Safe parsing for variations between API/Database naming and legacy code
  const displayTitle =
    candidate.title || candidate.role || "Professional Candidate";

  // Robustly extract years of experience from either numbers or text string fallbacks
  const displayExperience = (() => {
    if (
      candidate.yearsExperience !== undefined &&
      candidate.yearsExperience !== null
    ) {
      return `${candidate.yearsExperience} ${candidate.yearsExperience === 1 ? "year" : "years"} of experience`;
    }
    if (candidate.experience) {
      return typeof candidate.experience === "number"
        ? `${candidate.experience} years of experience`
        : candidate.experience;
    }
    return null;
  })();

  return (
    <div className="w-full h-screen flex flex-col bg-background overflow-hidden">
      {/* Header Panel */}
      <div className="px-10 py-8 bg-primary shrink-0 border-b border-primary/10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground">
            Candidate Profile
          </h2>
          <p className="text-sm text-primary-foreground/45 mt-1.5 font-normal">
            Review detailed background information, flags, and qualifications.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          className="font-semibold px-4 py-2"
        >
          <ArrowLeft className="size-4 mr-1.5" />
          Back to Previews
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-10">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Hero Main Card */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-5">
                  <Avatar className="size-20 border border-border/60 shrink-0">
                    <AvatarImage src={candidate.avatarUrl} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-2xl font-bold">
                      {candidate.name?.[0] ?? "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">
                      {candidate.name || "Anonymous Candidate"}
                    </h2>

                    {/* Always visible header token */}
                    <p className="text-base font-semibold text-primary mt-0.5 tracking-wide">
                      {displayTitle}
                    </p>

                    {candidate.headline && (
                      <p className="text-sm text-muted-foreground mt-2 italic bg-muted/30 px-3 py-1.5 rounded-lg border border-border/20 inline-block">
                        "{candidate.headline}"
                      </p>
                    )}

                    {/* Metadata Sub-Row */}
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground/80">
                      {candidate.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-primary/70" />
                          {candidate.location}
                        </span>
                      )}

                      {displayExperience && (
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="size-3.5 text-primary/70" />
                          {displayExperience}
                        </span>
                      )}

                      {candidate.remotePreference && (
                        <span className="flex items-center gap-1.5">
                          <Building className="size-3.5 text-primary/70" />
                          {candidate.remotePreference} Preference
                        </span>
                      )}

                      {candidate.availability && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-primary/70" />
                          {candidate.availability}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!!candidate.matchScore && (
                  <div className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0 tracking-wide">
                    <Star className="size-3.5 fill-current" />
                    {candidate.matchScore}% Match
                  </div>
                )}
              </div>

              {showInterest && (
                <div className="mt-6 pt-5 border-t border-border/50 flex gap-2">
                  <Button
                    size="sm"
                    variant={isInterested ? "secondary" : "default"}
                    onClick={onInterested}
                    disabled={isInterested}
                    className="font-semibold"
                  >
                    <Heart
                      className={`size-4 mr-1.5 ${isInterested ? "fill-current text-destructive" : ""}`}
                    />
                    {isInterested ? "Interest Sent" : "Mark Interested"}
                  </Button>
                </div>
              )}
            </div>

            {/* Profile Summary Block */}
            {candidate.summary && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground/60 mb-3">
                  Summary
                </h3>
                <p className="text-sm text-foreground/80 leading-relaxed tracking-wide">
                  {candidate.summary}
                </p>
              </div>
            )}

            {/* Semantic Profile Flags / Tags Section */}
            {candidate.flags && candidate.flags.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground/60 mb-4 flex items-center gap-2">
                  <Tag className="size-4 text-primary/70" />
                  Profile Flags & Skills
                </h3>

                <div className="flex flex-wrap gap-2">
                  {candidate.flags.map((flag: string) => (
                    <span
                      key={flag}
                      className="rounded-lg border border-border/40 bg-muted/60 px-3 py-1.5 text-xs font-semibold text-foreground tracking-wide hover:bg-muted transition-colors"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience Stream */}
            {candidate.workExperience &&
              candidate.workExperience.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground/60 mb-4">
                    Work Experience
                  </h3>

                  <div className="space-y-4">
                    {candidate.workExperience.map((exp, i) => (
                      <div
                        key={i}
                        className={`flex gap-4 ${
                          i < candidate.workExperience.length - 1
                            ? "pb-4 border-b border-border/30"
                            : ""
                        }`}
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted border border-border/20">
                          <Building className="size-4 text-muted-foreground/80" />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-foreground tracking-tight">
                            {exp.title}
                          </p>
                          <p className="text-sm font-medium text-muted-foreground/90 mt-0.5">
                            {exp.company}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-1 font-medium">
                            {exp.period}
                          </p>

                          {exp.description && (
                            <p className="text-sm text-foreground/70 mt-2 leading-relaxed tracking-wide">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Education Track */}
            {candidate.education && candidate.education.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground/60 mb-4">
                  Education
                </h3>

                <div className="space-y-4">
                  {candidate.education.map((edu, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted border border-border/20">
                        <GraduationCap className="size-4 text-muted-foreground/80" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-foreground tracking-tight">
                          {edu.degree}
                        </p>
                        <p className="text-sm font-medium text-muted-foreground/90 mt-0.5">
                          {edu.school}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1 font-medium">
                          {edu.period}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
