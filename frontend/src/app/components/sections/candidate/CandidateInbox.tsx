"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { API } from "../../../../api/auth";
import { Button } from "../../../components/ui/Button";
import { ScrollArea } from "../../../components/ui/ScrollArea";
import { Loader2, Inbox, Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/Avatar";

interface MatchStatus {
  statusId: number;
  pending: boolean;
  createdAt: string;
  companyId: number;
  companyName?: string;
  companyIndustry?: string;
  companyLocation?: string;
}

const getUserIdFromToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      payload.nameid ||
      payload.sub ||
      payload.id
    );
  } catch {
    return null;
  }
};

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

export function CandidateInbox() {
  const { token } = useAuth();
  const [statuses, setStatuses] = useState<MatchStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInbox() {
      try {
        const res = await API.get("/match");
        const raw: {
          statusId: number;
          pending: boolean;
          createdAt: string;
          companyId: number;
        }[] = res.data || [];

        // Only show pending ones (company interested, candidate hasn't responded)
        const pending = raw.filter((s) => s.pending);

        const enriched = await Promise.all(
          pending.map(async (s) => {
            try {
              const companyRes = await API.get(`/user/company/${s.companyId}`);
              const c = companyRes.data;
              return {
                ...s,
                companyName: c.name || "Unknown Company",
                companyIndustry: c.industry || null,
                companyLocation: c.headquarters || c.location || null,
              };
            } catch {
              return { ...s, companyName: "Unknown Company" };
            }
          }),
        );

        setStatuses(enriched);
      } catch (err) {
        console.error("Failed to load inbox:", err);
        setError("Failed to load requests.");
      } finally {
        setLoading(false);
      }
    }
    fetchInbox();
  }, []);

  const handleAccept = async (status: MatchStatus) => {
    if (!token || actingOn) return;
    const userId = getUserIdFromToken(token);
    if (!userId) return;

    setActingOn(status.statusId);
    try {
      await API.post("/match", {
        sourceId: parseInt(userId),
        targetId: status.companyId,
      });
      setStatuses((prev) => prev.filter((s) => s.statusId !== status.statusId));
    } catch (err: any) {
      setError(err.response?.data || "Failed to accept request.");
    } finally {
      setActingOn(null);
    }
  };

  const handleDecline = async (statusId: number) => {
    if (actingOn) return;
    setActingOn(statusId);
    try {
      await API.delete(`/match/${statusId}`);
      setStatuses((prev) => prev.filter((s) => s.statusId !== statusId));
    } catch (err: any) {
      setError(err.response?.data || "Failed to decline request.");
    } finally {
      setActingOn(null);
    }
  };

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
            <Inbox className="size-5 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium tracking-tight">No requests yet</p>
          <p className="text-sm text-muted-foreground">
            Companies will reach out when they find your profile interesting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      {error && (
        <div className="mx-4 mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid gap-3 p-4 lg:p-6">
        {statuses.map((status) => (
          <div
            key={status.statusId}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <Avatar className="size-11 shrink-0 border border-border">
                <AvatarImage src="" />
                <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                  {status.companyName?.[0] ?? "C"}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {status.companyName}
                    </p>
                    {status.companyIndustry && (
                      <p className="text-sm text-muted-foreground">
                        {status.companyIndustry}
                        {status.companyLocation
                          ? ` · ${status.companyLocation}`
                          : ""}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeTime(status.createdAt)}
                  </span>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  This company is interested in your profile.
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(status)}
                    disabled={actingOn === status.statusId}
                  >
                    {actingOn === status.statusId ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDecline(status.statusId)}
                    disabled={actingOn === status.statusId}
                  >
                    <X className="size-4" />
                    Decline
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
