"use client";

import { useState } from "react";
import { Button } from "../../ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/Avatar";
import { ScrollArea } from "../../ui/ScrollArea";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "../../ui/Empty";
import type { Request, Company } from "../../../pages/CandidateDashboard";
import { CompanyProfileView } from "./CompanyProfileView";

// Icons
function InboxIcon({ className }: { className?: string }) {
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
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
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

function XIcon({ className }: { className?: string }) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
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
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

interface CandidateInboxProps {
  requests: Request[];
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}

export function CandidateInbox({
  requests,
  onAccept,
  onDecline,
}: CandidateInboxProps) {
  const [viewingCompany, setViewingCompany] = useState<{
    company: Company;
    role: string;
  } | null>(null);

  const pendingRequests = requests.filter((r) => r.status === "pending");

  const handleViewCompany = (company: Company, role: string) => {
    setViewingCompany({ company, role });
  };

  if (viewingCompany) {
    return (
      <CompanyProfileView
        company={viewingCompany.company}
        role={viewingCompany.role}
        onClose={() => setViewingCompany(null)}
      />
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Empty className="border-none bg-transparent">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No requests yet</EmptyTitle>
            <EmptyDescription>
              Companies will reach out when they find your profile interesting.
              In the meantime, make sure your profile is complete.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="grid gap-3 p-4 lg:p-6">
        {pendingRequests.map((request) => (
          <div
            key={request.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <Avatar className="size-11 shrink-0 border border-border">
                <AvatarImage src={request.company.logo} />
                <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                  {request.company.name[0]}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <button
                      onClick={() =>
                        handleViewCompany(request.company, request.role)
                      }
                      className="text-sm font-semibold text-foreground hover:text-primary transition-colors text-left"
                    >
                      {request.company.name}
                    </button>
                    <p className="text-sm text-muted-foreground">
                      {request.role}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeTime(request.createdAt)}
                  </span>
                </div>

                <p className="mt-3 text-sm text-foreground/80 line-clamp-2 leading-relaxed">
                  {request.message}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  From {request.recruiterName}, {request.recruiterTitle}
                </p>

                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <Button size="sm" onClick={() => onAccept(request.id)}>
                    <CheckIcon className="size-4" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDecline(request.id)}
                  >
                    <XIcon className="size-4" />
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleViewCompany(request.company, request.role)
                    }
                  >
                    <BuildingIcon className="size-4" />
                    Company
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
