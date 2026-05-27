"use client";

import { useState, type ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { Button } from "./Button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./Sheet";
import { useIsMobile } from "../../../hooks/useMobile";
import { useUser } from "../../../context/UserContext";
import {
  InboxIcon,
  MessageSquareIcon,
  SettingsIcon,
  UserIcon,
  LogOutIcon,
} from "./Icons";
import { SearchIcon, BriefcaseIcon } from "lucide-react";

export type Section =
  | "requests"
  | "chats"
  | "job-profile"
  | "profile"
  | "settings"
  | "search"
  | "inbox"
  | "job-offers";

export interface SidebarUser {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

interface SidebarProps {
  role?: "candidate" | "company";
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  requestCount: number;
  unreadCount: number;
  onLogout: () => void;
  user?: SidebarUser;
  children: ReactNode;
}

type NavItem = {
  id: Section;
  label: string;
  icon: ReactNode;
  badgeKey?: "requestCount" | "unreadCount";
};

const sectionTitle: Record<Section, string> = {
  requests: "Requests",
  chats: "Messages",
  "job-profile": "Job Profile",
  profile: "Profile",
  settings: "Settings",
  search: "Candidate Search",
  inbox: "Inbox",
  "job-offers": "Job Offers",
};

export function Sidebar({
  role = "candidate",
  activeSection,
  onSectionChange,
  requestCount,
  unreadCount,
  onLogout,
  user,
  children,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const { userProfile } = useUser();

  const profile = userProfile ?? user;

  // Dynamically compute layout sets depending on the dashboard scope
  const groups: Array<{ title: string; items: NavItem[] }> =
    role === "company"
      ? [
          {
            title: "Recruitment",
            items: [
              {
                id: "search",
                label: "Candidate Search",
                icon: <SearchIcon className="size-4" />,
              },
              {
                id: "job-offers",
                label: "Job Offers",
                icon: <BriefcaseIcon className="size-4" />,
              },
            ],
          },
          {
            title: "Messages",
            items: [
              {
                id: "inbox",
                label: "Inbox",
                icon: <InboxIcon className="size-4" />,
                badgeKey: "requestCount",
              },
              {
                id: "chats",
                label: "Chats",
                icon: <MessageSquareIcon className="size-4" />,
                badgeKey: "unreadCount",
              },
            ],
          },
          {
            title: "Account",
            items: [
              {
                id: "profile",
                label: "Profile",
                icon: <UserIcon className="size-4" />,
              },
              {
                id: "settings",
                label: "Settings",
                icon: <SettingsIcon className="size-4" />,
              },
            ],
          },
        ]
      : [
          {
            title: "Messages",
            items: [
              {
                id: "requests",
                label: "Requests",
                icon: <InboxIcon className="size-4" />,
                badgeKey: "requestCount",
              },
              {
                id: "chats",
                label: "Chats",
                icon: <MessageSquareIcon className="size-4" />,
                badgeKey: "unreadCount",
              },
            ],
          },
          {
            title: "Matching & Growth",
            items: [
              {
                id: "job-profile",
                label: "Job Profile",
                icon: <BriefcaseIcon className="size-4" />, // Reused Lucide icon here nicely
              },
            ],
          },
          {
            title: "Account",
            items: [
              {
                id: "profile",
                label: "Profile",
                icon: <UserIcon className="size-4" />,
              },
              {
                id: "settings",
                label: "Settings",
                icon: <SettingsIcon className="size-4" />,
              },
            ],
          },
        ];

  const badgeValue = (key: string) => {
    if (key === "requestCount") return requestCount;
    if (key === "unreadCount") return unreadCount;
    return 0;
  };

  const buildLabel = (item: NavItem) => (
    <button
      type="button"
      onClick={() => {
        onSectionChange(item.id);
        if (isMobile) setMobileOpen(false);
      }}
      className={`w-full rounded-xl px-3 py-3 text-left transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
        activeSection === item.id
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground"
      }`}
    >
      <div className="flex items-center gap-3">
        {item.icon}
        <span className="truncate text-sm font-medium">{item.label}</span>
        {item.badgeKey && badgeValue(item.badgeKey) > 0 ? (
          <span className="ml-auto inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
            {badgeValue(item.badgeKey)}
          </span>
        ) : null}
      </div>
    </button>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col p-4">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-semibold">
          W
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Waylay</p>
          <p className="text-xs text-muted-foreground capitalize">
            {role} dashboard
          </p>
        </div>
      </div>
      <div className="space-y-4 flex-1 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.title} className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/70">
              {group.title}
            </div>
            <div className="space-y-2">
              {group.items.map((item) => (
                <div key={item.id}>{buildLabel(item)}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-11">
            <AvatarImage src={""} />
            <AvatarFallback className="bg-muted text-muted-foreground text-sm">
              {profile
                ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`
                : "JD"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {profile
                ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
                : "Your name"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {profile?.email ?? "Not signed in"}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-4 w-full justify-center"
          onClick={onLogout}
        >
          <LogOutIcon className="size-4" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 text-sidebar-foreground md:flex">
      <aside className="hidden w-72 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        {sidebarContent}
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
            <span className="sr-only">Open menu</span>
          </Button>
          <div className="text-sm font-semibold">
            {sectionTitle[activeSection]}
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOutIcon className="size-4" />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="bg-sidebar text-sidebar-foreground p-0"
        >
          <SheetHeader className="border-b border-border px-4 py-4">
            <div>
              <SheetTitle>Waylay</SheetTitle>
              <SheetDescription>Navigation</SheetDescription>
            </div>
          </SheetHeader>
          <div className="h-[calc(100vh-5rem)] overflow-y-auto">
            {sidebarContent}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
