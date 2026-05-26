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
  Globe,
  Heart,
  Star,
  Clock,
  GraduationCap,
  Building,
  ExternalLink,
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
  workExperience: WorkExperience[];
  education: Education[];
  desiredRoles: string[];
  desiredIndustries: string[];
  salaryExpectation: string;
  githubUrl: string;
  portfolioUrl: string;
  linkedinUrl: string;
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
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3 shrink-0">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 lg:p-6">
          <div className="mx-auto max-w-2xl space-y-4">
            {/* Hero */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Avatar className="size-16 border border-border shrink-0">
                    <AvatarImage src={candidate.avatarUrl} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xl font-medium">
                      {candidate.name?.[0] ?? "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {candidate.name}
                    </h2>
                    <p className="text-sm font-medium text-primary mt-0.5">
                      {candidate.role}
                    </p>

                    {candidate.headline && (
                      <p className="text-sm text-muted-foreground mt-1 italic">
                        "{candidate.headline}"
                      </p>
                    )}

                    <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {candidate.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {candidate.location}
                        </span>
                      )}

                      {candidate.experience && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="size-3" />
                          {candidate.experience}
                        </span>
                      )}

                      {candidate.remotePreference && (
                        <span className="flex items-center gap-1">
                          <Building className="size-3" />
                          {candidate.remotePreference}
                        </span>
                      )}

                      {candidate.availability && (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {candidate.availability}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {candidate.matchScore && (
                  <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 shrink-0">
                    <Star className="size-3" />
                    {candidate.matchScore}% match
                  </div>
                )}
              </div>

              {showInterest && (
                <div className="mt-5 pt-4 border-t border-border flex gap-2">
                  <Button
                    size="sm"
                    variant={isInterested ? "secondary" : "default"}
                    onClick={onInterested}
                    disabled={isInterested}
                  >
                    <Heart
                      className={`size-4 ${isInterested ? "fill-current" : ""}`}
                    />
                    {isInterested ? "Interest Sent" : "Mark Interested"}
                  </Button>
                </div>
              )}
            </div>

            {/* About */}
            {candidate.summary && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  About
                </h3>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {candidate.summary}
                </p>
              </div>
            )}

            {/* Work Experience */}
            {candidate.workExperience?.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Work Experience
                </h3>

                <div className="space-y-4">
                  {candidate.workExperience.map((exp, i) => (
                    <div
                      key={i}
                      className={`flex gap-4 ${
                        i < candidate.workExperience.length - 1
                          ? "pb-4 border-b border-border"
                          : ""
                      }`}
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Building className="size-4 text-muted-foreground" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {exp.title}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {exp.company}
                        </p>

                        <p className="text-xs text-muted-foreground mt-0.5">
                          {exp.period}
                        </p>

                        {exp.description && (
                          <p className="text-sm text-foreground/70 mt-1.5 leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {candidate.education?.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Education
                </h3>

                <div className="space-y-3">
                  {candidate.education.map((edu, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <GraduationCap className="size-4 text-muted-foreground" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {edu.degree}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {edu.school}
                        </p>

                        <p className="text-xs text-muted-foreground mt-0.5">
                          {edu.period}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {candidate.skills?.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Skills
                </h3>

                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Job Preferences */}
            {(candidate.desiredRoles?.length > 0 ||
              candidate.desiredIndustries?.length > 0 ||
              candidate.salaryExpectation) && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Job Preferences
                </h3>

                <div className="space-y-2.5 text-sm">
                  {candidate.desiredRoles?.length > 0 && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-28 shrink-0">
                        Roles
                      </span>
                      <span className="text-foreground">
                        {candidate.desiredRoles.join(", ")}
                      </span>
                    </div>
                  )}

                  {candidate.desiredIndustries?.length > 0 && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-28 shrink-0">
                        Industries
                      </span>
                      <span className="text-foreground">
                        {candidate.desiredIndustries.join(", ")}
                      </span>
                    </div>
                  )}

                  {candidate.salaryExpectation && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-28 shrink-0">
                        Salary
                      </span>
                      <span className="text-foreground">
                        {candidate.salaryExpectation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Links */}
            {(candidate.githubUrl ||
              candidate.portfolioUrl ||
              candidate.linkedinUrl) && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Links
                </h3>

                <div className="flex flex-col gap-2">
                  {candidate.githubUrl && (
                    <a
                      href={candidate.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors group"
                    >
                      <p>GitHub Icon {":("}</p>
                      <span className="flex-1 text-foreground font-medium">
                        GitHub
                      </span>
                      <ExternalLink className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </a>
                  )}

                  {candidate.portfolioUrl && (
                    <a
                      href={candidate.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors group"
                    >
                      <Globe className="size-4 text-muted-foreground shrink-0" />
                      <span className="flex-1 text-foreground font-medium">
                        Portfolio
                      </span>
                      <ExternalLink className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </a>
                  )}

                  {candidate.linkedinUrl && (
                    <a
                      href={candidate.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors group"
                    >
                      <ExternalLink className="size-4 text-muted-foreground shrink-0" />
                      <span className="flex-1 text-foreground font-medium">
                        LinkedIn
                      </span>
                      <ExternalLink className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
