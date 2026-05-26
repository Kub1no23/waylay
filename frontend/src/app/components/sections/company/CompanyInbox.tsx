import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { ScrollArea } from "../../../components/ui/ScrollArea";
import { Bell, Handshake, MessageSquare } from "lucide-react";

interface Notification {
  id: string;
  type: "match" | "message";
  candidateName: string;
  role: string;
  preview: string;
  createdAt: Date;
  read: boolean;
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

const TYPE_CONFIG: Record<
  string,
  { icon: any; label: string; bg: string; description: string | null }
> = {
  match: {
    icon: Handshake,
    label: "accepted your interest",
    bg: "bg-emerald-100 text-emerald-600",
    description: "You're now matched — start a conversation.",
  },
  message: {
    icon: MessageSquare,
    label: "sent you a message",
    bg: "bg-blue-100 text-blue-600",
    description: null,
  },
};

const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "match",
    candidateName: "Alex Johnson",
    role: "Senior Frontend Engineer",
    preview: "Great to hear from you!",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: "n2",
    type: "message",
    candidateName: "Sarah Smith",
    role: "Full Stack Developer",
    preview: "When would be a good time to chat?",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
  },
];

interface CompanyInboxProps {
  onOpenChat?: () => void;
}

export default function CompanyInbox({ onOpenChat }: CompanyInboxProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (!notifications.length) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <Bell className="size-5 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium tracking-tight">No notifications</p>
          <p className="text-sm text-muted-foreground">
            When a candidate accepts your interest, you'll see it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2.5">
          <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={markAllRead}
          >
            Mark all as read
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="grid gap-2 p-4 lg:p-6">
          {notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type];
            const Icon = cfg.icon;

            return (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                  n.read
                    ? "border-border bg-card"
                    : "border-border border-l-2 border-l-primary bg-card"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}
                  >
                    <Icon className="size-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm text-foreground">
                          <span className="font-semibold">
                            {n.candidateName}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {cfg.label}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {n.role}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {!n.read && (
                          <span className="size-2 rounded-full bg-primary" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                    </div>

                    {n.preview && (
                      <p className="mt-1.5 line-clamp-1 text-xs italic text-muted-foreground">
                        "{n.preview}"
                      </p>
                    )}

                    {cfg.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {cfg.description}
                      </p>
                    )}

                    <div className="mt-3">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenChat?.();
                        }}
                      >
                        <MessageSquare className="size-4" />
                        {n.type === "match" ? "Open Chat" : "Reply"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
