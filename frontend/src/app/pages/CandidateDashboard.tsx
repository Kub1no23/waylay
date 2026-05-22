"use client";

import { useState } from "react";
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
} from "../components/ui/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { CandidateProfile } from "../components/sections/candidate/CandidateProfile";
import { CandidateSettings } from "../components/sections/candidate/CandidateSettings";
import { CandidateInbox } from "../components/sections/candidate/CandidateInbox";

// Icons
function UserIcon({ className }: { className?: string }) {
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

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

function LogOutIcon({ className }: { className?: string }) {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

type Section = "profile" | "settings" | "inbox";

// Mock user data
const mockUser = {
  firstName: "Alex",
  lastName: "Johnson",
  email: "alex.johnson@example.com",
  avatarUrl: "",
};

// Mock data for demonstration
export const mockRequests = [
  {
    id: "req-1",
    company: {
      id: "comp-1",
      name: "TechCorp Solutions",
      logo: "",
      industry: "Software Development",
      size: "50-200 employees",
      location: "San Francisco, CA",
      description:
        "TechCorp Solutions is a leading software development company specializing in enterprise solutions. We build scalable applications that help businesses transform their operations.",
      website: "https://techcorp.example.com",
    },
    role: "Senior Frontend Engineer",
    message:
      "Hi Alex, we were impressed by your profile and would love to discuss our Senior Frontend Engineer position. We think your experience with React and TypeScript would be a great fit for our team.",
    recruiterName: "Sarah Miller",
    recruiterTitle: "Technical Recruiter",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: "pending" as const,
  },
  {
    id: "req-2",
    company: {
      id: "comp-2",
      name: "StartupXYZ",
      logo: "",
      industry: "FinTech",
      size: "10-50 employees",
      location: "New York, NY",
      description:
        "StartupXYZ is revolutionizing the way people manage their finances. Our AI-powered platform helps users make smarter financial decisions.",
      website: "https://startupxyz.example.com",
    },
    role: "Full Stack Developer",
    message:
      "Hello! We are building something exciting in the FinTech space and your background caught our attention. Would you be interested in chatting about joining our engineering team?",
    recruiterName: "Mike Chen",
    recruiterTitle: "Co-founder & CTO",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    status: "pending" as const,
  },
];

export const mockChats = [
  {
    id: "chat-1",
    company: {
      id: "comp-3",
      name: "InnovateTech",
      logo: "",
      industry: "AI/ML",
      size: "200-500 employees",
      location: "Seattle, WA",
      description:
        "InnovateTech is at the forefront of artificial intelligence and machine learning. We develop cutting-edge AI solutions for healthcare, finance, and transportation.",
      website: "https://innovatetech.example.com",
    },
    role: "Software Engineer - AI Platform",
    recruiterName: "Emily Davis",
    recruiterTitle: "Senior Recruiter",
    lastMessage: {
      content: "Great! I'll send over the interview details shortly.",
      isFromCompany: true,
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    unreadCount: 1,
    messages: [
      {
        id: "msg-1",
        content:
          "Hi Alex! Thanks for accepting our request. We'd love to schedule a call to discuss the AI Platform Engineer role. Are you available this week?",
        isFromCompany: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: "msg-2",
        content:
          "Hi Emily! Yes, I'm very interested in learning more about the role. I'm available Thursday or Friday afternoon.",
        isFromCompany: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: "msg-3",
        content:
          "Perfect! Let's do Thursday at 3 PM PST. I'll send a calendar invite.",
        isFromCompany: true,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        id: "msg-4",
        content: "Sounds good, looking forward to it!",
        isFromCompany: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        id: "msg-5",
        content: "Great! I'll send over the interview details shortly.",
        isFromCompany: true,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    ],
  },
];

export type Request = (typeof mockRequests)[0];
export type Chat = (typeof mockChats)[0];
export type Company = Request["company"];

interface CandidateDashboardProps {
  onLogout?: () => void;
}

export default function CandidateDashboard({
  onLogout,
}: CandidateDashboardProps) {
  const [activeSection, setActiveSection] = useState<Section>("inbox");

  const totalUnread =
    mockRequests.filter((r) => r.status === "pending").length +
    mockChats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  const handleLogout = () => {
    onLogout?.();
  };

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <CandidateProfile />;
      case "settings":
        return <CandidateSettings />;
      case "inbox":
        return <CandidateInbox />;
      default:
        return null;
    }
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

        <SidebarContent className="px-2 py-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeSection === "inbox"}
                onClick={() => setActiveSection("inbox")}
                tooltip="Inbox"
              >
                <InboxIcon className="size-4" />
                <span>Inbox</span>
              </SidebarMenuButton>
              {totalUnread > 0 && (
                <SidebarMenuBadge className="bg-primary text-primary-foreground">
                  {totalUnread}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeSection === "profile"}
                onClick={() => setActiveSection("profile")}
                tooltip="Profile"
              >
                <UserIcon className="size-4" />
                <span>Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeSection === "settings"}
                onClick={() => setActiveSection("settings")}
                tooltip="Settings"
              >
                <SettingsIcon className="size-4" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
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
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              className="shrink-0"
            >
              <LogOutIcon className="size-4" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b border-border px-4 lg:px-6">
          <SidebarTrigger className="-ml-2" />
          <h1 className="text-lg font-semibold text-foreground capitalize">
            {activeSection}
          </h1>
        </header>

        <main className="flex-1 overflow-auto">{renderContent()}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
