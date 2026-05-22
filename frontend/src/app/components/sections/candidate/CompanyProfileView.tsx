"use client";

import { Button } from "../../ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/Avatar";
import { Badge } from "../../ui/Badge";
import { ScrollArea } from "../../ui/ScrollArea";
import type { Company } from "../../../pages/CandidateDashboard";

// Icons
function ArrowLeftIcon({ className }: { className?: string }) {
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
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
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
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
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
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
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
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

interface CompanyProfileViewProps {
  company: Company;
  role: string;
  onClose: () => void;
}

export function CompanyProfileView({
  company,
  role,
  onClose,
}: CompanyProfileViewProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 lg:px-6">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="shrink-0"
        >
          <ArrowLeftIcon className="size-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h2 className="text-sm font-semibold text-foreground">
          Company Profile
        </h2>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 lg:p-6">
          <div className="mx-auto max-w-2xl">
            {/* Company Header */}
            <div className="flex items-start gap-4">
              <Avatar className="size-16 shrink-0">
                <AvatarImage src={company.logo} />
                <AvatarFallback className="bg-muted text-muted-foreground text-xl">
                  {company.name[0]}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold text-foreground">
                  {company.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {company.industry}
                </p>
              </div>
            </div>

            {/* Role Badge */}
            <div className="mt-6">
              <Badge variant="secondary" className="text-sm">
                Hiring for: {role}
              </Badge>
            </div>

            {/* Company Details */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <MapPinIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-foreground">{company.location}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <UsersIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-foreground">{company.size}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <BriefcaseIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-foreground">{company.industry}</span>
              </div>

              {company.website && (
                <div className="flex items-center gap-3 text-sm">
                  <GlobeIcon className="size-4 shrink-0 text-muted-foreground" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {company.website.replace(/^https?:\/\//, "")}
                    <ExternalLinkIcon className="size-3" />
                  </a>
                </div>
              )}
            </div>

            {/* About */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-foreground">
                About the Company
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {company.description}
              </p>
            </div>

            {/* Action */}
            <div className="mt-8 pt-6 border-t border-border">
              <Button onClick={onClose} className="w-full sm:w-auto">
                Back to Inbox
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
