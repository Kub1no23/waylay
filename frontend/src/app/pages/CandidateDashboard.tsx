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
import { CandidateProfile } from "../components/sections/candidate/CandidateProfile";
import { CandidateSettings } from "../components/sections/candidate/CandidateSettings";
import { CandidateInbox } from "../components/sections/candidate/CandidateInbox";
import { ChatsView } from "../components/sections/ChatsView";

import { useAuth } from "../../api/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  UserIcon,
  SettingsIcon,
  InboxIcon,
  MessageSquareIcon,
  LogOutIcon,
} from "../components/ui/Icons";

type Section = "profile" | "settings" | "requests" | "chats";

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
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
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
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
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
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
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
  const [activeSection, setActiveSection] = useState<Section>("requests");
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [chats, setChats] = useState<Chat[]>(mockChats);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  const handleLogout = () => {
    onLogout?.();
  };

  const handleAcceptRequest = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    setRequests((prev) => prev.filter((r) => r.id !== requestId));

    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      company: request.company,
      role: request.role,
      recruiterName: request.recruiterName,
      recruiterTitle: request.recruiterTitle,
      lastMessage: {
        content: request.message,
        isFromCompany: true,
        createdAt: request.createdAt,
      },
      unreadCount: 0,
      messages: [
        {
          id: `msg-${Date.now()}`,
          content: request.message,
          isFromCompany: true,
          createdAt: request.createdAt,
        },
      ],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveSection("chats");
  };

  const handleDeclineRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const handleSendMessage = (chatId: string, content: string) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== chatId) return chat;
        const newMessage = {
          id: `msg-${Date.now()}`,
          content,
          isFromCompany: false,
          createdAt: new Date(),
        };
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: {
            content,
            isFromCompany: false,
            createdAt: new Date(),
          },
        };
      }),
    );
  };

  const handleMarkChatAsRead = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)),
    );
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case "requests":
        return "Requests";
      case "chats":
        return "Messages";
      case "profile":
        return "Profile";
      case "settings":
        return "Settings";
      default:
        return "";
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <CandidateProfile />;
      case "settings":
        return <CandidateSettings />;
      case "requests":
        return (
          <CandidateInbox
            requests={requests}
            onAccept={handleAcceptRequest}
            onDecline={handleDeclineRequest}
          />
        );
      case "chats":
        return (
          <ChatsView
            chats={chats}
            onSendMessage={handleSendMessage}
            onMarkAsRead={handleMarkChatAsRead}
          />
        );
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

        <SidebarContent className="px-2 py-2">
          <SidebarGroup>
            <SidebarGroupLabel>Messages</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeSection === "requests"}
                  onClick={() => setActiveSection("requests")}
                  tooltip="Requests"
                >
                  <InboxIcon className="size-4" />
                  <span>Requests</span>
                </SidebarMenuButton>
                {pendingRequests.length > 0 && (
                  <SidebarMenuBadge className="bg-primary text-primary-foreground">
                    {pendingRequests.length}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeSection === "chats"}
                  onClick={() => setActiveSection("chats")}
                  tooltip="Chats"
                >
                  <MessageSquareIcon className="size-4" />
                  <span>Chats</span>
                </SidebarMenuButton>
                {totalUnread > 0 && (
                  <SidebarMenuBadge className="bg-primary text-primary-foreground">
                    {totalUnread}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarMenu>
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
          </SidebarGroup>
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
                <Button variant="ghost" size="icon-sm" className="shrink-0">
                  <LogOutIcon className="size-4" />
                  <span className="sr-only">Log out</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to sign out? You will need to sign in
                    again to access your dashboard.
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
            {getSectionTitle()}
          </h1>
        </header>

        <main className="flex-1 overflow-auto">{renderContent()}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
