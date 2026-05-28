import { useEffect, useState } from "react";
import { API } from "../../../../api/auth";
import { Button } from "../../../components/ui/Button";
import { ScrollArea } from "../../../components/ui/ScrollArea";
import { Bell, Handshake, Clock, Loader2, MessageSquare } from "lucide-react";

interface MatchStatus {
  statusId: number;
  pending: boolean;
  createdAt: string;
  candidateId: number;
  candidateName?: string;
  candidateHeadline?: string;
}

function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

interface CompanyInboxProps {
  onOpenChat?: () => void;
}

export default function CompanyInbox({ onOpenChat }: CompanyInboxProps) {
  const [statuses, setStatuses] = useState<MatchStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInbox() {
      try {
        const res = await API.get("/match");
        const raw: {
          statusId: number;
          pending: boolean;
          createdAt: string;
          candidateId: number;
        }[] = res.data || [];

        const enriched = await Promise.all(
          raw.map(async (s) => {
            try {
              const userRes = await API.get(`/user/candidate/${s.candidateId}`);
              const u = userRes.data;
              return {
                ...s,
                candidateName:
                  [u.firstName, u.lastName].filter(Boolean).join(" ") ||
                  "Candidate",
                candidateHeadline: u.headline || null,
              };
            } catch {
              return { ...s, candidateName: "Candidate" };
            }
          }),
        );

        setStatuses(enriched);
      } catch (err) {
        console.error("Failed to load company inbox:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInbox();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (statuses.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <Bell className="size-5 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium tracking-tight">No activity yet</p>
          <p className="text-sm text-muted-foreground">
            Candidates you've shown interest in will appear here.
          </p>
        </div>
      </div>
    );
  }

  const matched = statuses.filter((s) => !s.pending);
  const pending = statuses.filter((s) => s.pending);

  return (
    <ScrollArea className="h-full">
      <div className="grid gap-3 p-4 lg:p-6">
        {matched.length > 0 && (
          <>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Matched
            </p>
            {matched.map((s) => (
              <div
                key={s.statusId}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Handshake className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {s.candidateName}
                        </p>
                        {s.candidateHeadline && (
                          <p className="text-xs text-muted-foreground">
                            {s.candidateHeadline}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatRelativeTime(s.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Accepted your interest — you're now matched!
                    </p>
                    <div className="mt-3">
                      <Button size="sm" onClick={onOpenChat}>
                        <MessageSquare className="size-4" />
                        Open Chat
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {pending.length > 0 && (
          <>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-2">
              Pending
            </p>
            {pending.map((s) => (
              <div
                key={s.statusId}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Clock className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {s.candidateName}
                        </p>
                        {s.candidateHeadline && (
                          <p className="text-xs text-muted-foreground">
                            {s.candidateHeadline}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatRelativeTime(s.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Interest sent — waiting for candidate to respond.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </ScrollArea>
  );
}
