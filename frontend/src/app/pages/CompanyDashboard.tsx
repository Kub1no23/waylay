import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
} from "../components/ui/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/AlertDialog";
import {
  Search,
  Bell,
  MessageSquare,
  Building2,
  Settings,
  LogOut,
  Briefcase,
} from "lucide-react";

import CandidateSearch from "../components/sections/company/CandidateSearch";
import CompanyInbox from "../components/sections/company/CompanyInbox";
import { ChatsView } from "../components/sections/ChatsView";
import CompanyProfile from "../components/sections/company/CompanyProfile";
import CompanySettings from "../components/sections/company/CompanySettings";
import RecruitingProfiles from "../components/sections/company/RecruitingProfiles";

type Section =
  | "search"
  | "inbox"
  | "chats"
  | "job-offers"
  | "profile"
  | "settings";

interface Message {
  id: string;
  content: string;
  isFromCompany: boolean;
  createdAt: Date;
}

interface Chat {
  id: string;
  candidateName: string;
  candidateAvatar: string;
  role: string;
  lastMessage: {
    content: string;
    isFromCompany: boolean;
    createdAt: Date;
  };
  unreadCount: number;
  messages: Message[];
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
}

interface Badges {
  inbox: number;
  chats: number;
}

interface NavItem {
  id: Section;
  icon: LucideIcon;
  label: string;
  badgeKey?: keyof Badges;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const mockChats: Chat[] = [
  {
    id: "chat-1",
    candidateName: "Jordan Lee",
    candidateAvatar: "",
    role: "Software Engineer – AI Platform",
    lastMessage: {
      content: "Thanks for the update! Looking forward to the next round.",
      isFromCompany: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    unreadCount: 1,
    messages: [
      {
        id: "m1",
        content:
          "Hi Jordan! Thanks for your interest. We'd love to schedule a technical interview. Available this week?",
        isFromCompany: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: "m2",
        content: "Hi! Yes, available Thursday or Friday afternoon.",
        isFromCompany: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: "m3",
        content: "Let's do Thursday at 3 PM PST. I'll send a calendar invite.",
        isFromCompany: true,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        id: "m4",
        content: "Thanks for the update! Looking forward to the next round.",
        isFromCompany: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    ],
  },
];

const mockUser: User = {
  firstName: "TechCorp",
  lastName: "HR",
  email: "hr@techcorp.example.com",
  avatarUrl: "",
};

const SECTION_TITLES: Record<Section, string> = {
  search: "Candidate Search",
  inbox: "Inbox",
  chats: "Messages",
  "job-offers": "Job Offers",
  profile: "Company Profile",
  settings: "Settings",
};

const NAV: NavGroup[] = [
  {
    group: "Recruiting",
    items: [
      {
        id: "search",
        icon: Search,
        label: "Search",
      },
      {
        id: "inbox",
        icon: Bell,
        label: "Inbox",
        badgeKey: "inbox",
      },
      {
        id: "chats",
        icon: MessageSquare,
        label: "Chats",
        badgeKey: "chats",
      },
      {
        id: "job-offers",
        icon: Briefcase,
        label: "Job Offers",
      },
    ],
  },
  {
    group: "Company",
    items: [
      {
        id: "profile",
        icon: Building2,
        label: "Profile",
      },
      {
        id: "settings",
        icon: Settings,
        label: "Settings",
      },
    ],
  },
];

export default function CompanyDashboard() {
  const [activeSection, setActiveSection] = useState<Section>("search");
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [interestedIds, setInterestedIds] = useState<string[]>([]);

  const inboxUnread = 2;
  const unreadMessages = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  const badges: Badges = {
    inbox: inboxUnread,
    chats: unreadMessages,
  };

  const handleInterested = (id: string) => {
    setInterestedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleSendMessage = (chatId: string, content: string) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== chatId) return chat;

        const msg: Message = {
          id: `msg-${Date.now()}`,
          content,
          isFromCompany: true,
          createdAt: new Date(),
        };

        return {
          ...chat,
          messages: [...chat.messages, msg],
          lastMessage: {
            content,
            isFromCompany: true,
            createdAt: new Date(),
          },
        };
      }),
    );
  };

  const handleMarkAsRead = (chatId: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat,
      ),
    );
  };

  const handleLogout = () => {
    console.log("Logged out");
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
              W
            </div>
            <span className="font-semibold text-foreground">Waylay</span>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-2">
          {NAV.map(({ group, items }) => (
            <SidebarGroup key={group}>
              <SidebarGroupLabel>{group}</SidebarGroupLabel>

              <SidebarMenu>
                {items.map(({ id, icon: Icon, label, badgeKey }) => {
                  const badge = badgeKey ? badges[badgeKey] : 0;

                  return (
                    <SidebarMenuItem key={id}>
                      <SidebarMenuButton
                        isActive={activeSection === id}
                        onClick={() => setActiveSection(id)}
                        tooltip={label}
                      >
                        <Icon className="size-4" />
                        <span>{label}</span>
                      </SidebarMenuButton>

                      {badge > 0 && (
                        <SidebarMenuBadge className="bg-primary text-primary-foreground">
                          {badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="border-t border-border p-2">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar className="size-8">
              <AvatarImage src={mockUser.avatarUrl} />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                {mockUser.firstName[0]}
                {mockUser.lastName[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-foreground">
                {mockUser.firstName} {mockUser.lastName}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {mockUser.email}
              </span>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 size-8">
                  <LogOut className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to sign out?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Sign out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-muted/30">
        <header className="flex h-12 items-center gap-4 border-b border-border bg-background px-4">
          <SidebarTrigger className="-ml-2" />
          <h1 className="text-sm font-medium text-foreground">
            {SECTION_TITLES[activeSection]}
          </h1>
        </header>

        <main className="flex-1 overflow-auto h-[calc(100vh-48px)]">
          {activeSection === "search" && (
            <CandidateSearch
              onInterested={handleInterested}
              interestedIds={interestedIds}
            />
          )}

          {activeSection === "inbox" && (
            <CompanyInbox onOpenChat={() => setActiveSection("chats")} />
          )}

          {activeSection === "chats" && (
            <ChatsView
              chats={chats}
              isCompany={true}
              onSendMessage={handleSendMessage}
              onMarkAsRead={handleMarkAsRead}
            />
          )}

          {activeSection === "job-offers" && (
            <div className="p-4 lg:p-6">
              <div className="mx-auto max-w-2xl">
                <RecruitingProfiles />
              </div>
            </div>
          )}

          {activeSection === "profile" && <CompanyProfile />}

          {activeSection === "settings" && <CompanySettings />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
