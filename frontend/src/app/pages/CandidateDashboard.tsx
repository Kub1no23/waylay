"use client";

import { useState } from "react";
import { useAuth } from "../../api/AuthContext";
import { useUser } from "../../context/UserContext";
import { Sidebar, type Section } from "../components/ui/Sidebar";
import { CandidateProfile } from "../components/sections/candidate/CandidateProfile";
import { CandidateSettings } from "../components/sections/candidate/CandidateSettings";
import { CandidateInbox } from "../components/sections/candidate/CandidateInbox";
import { ChatsView } from "../components/sections/ChatsView";
import ChatsPreview from "../components/sections/ChatsPreview";

export type Company = {
  id: string;
  name: string;
  logo: string;
  industry: string;
  size: string;
  location: string;
  description: string;
  website: string;
};

export type Request = {
  id: string;
  company: Company;
  role: string;
  message: string;
  recruiterName: string;
  recruiterTitle: string;
  createdAt: Date;
  status: "pending" | "accepted" | "declined";
};

export type ChatMessage = {
  id: string;
  content: string;
  isFromCompany: boolean;
  createdAt: Date;
};

export type Chat = {
  id: string;
  company: Company;
  role: string;
  recruiterName: string;
  recruiterTitle: string;
  lastMessage: {
    content: string;
    isFromCompany: boolean;
    createdAt: Date;
  };
  unreadCount: number;
  messages: ChatMessage[];
};

export default function CandidateDashboard() {
  const auth = useAuth();
  const { inboxCount, unreadCount, loading, error } = useUser();
  const [activeSection, setActiveSection] = useState<Section>("requests");

  const [requests] = useState<Request[]>([]);

  if (!auth.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 text-center text-sm text-foreground">
        Please sign in to see your candidate dashboard.
      </div>
    );
  }
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 text-center text-sm text-foreground">
        Error loading dashboard: {error}
      </div>
    );
  }

  const handleAcceptRequest = (requestId: string) => {
    console.warn("accept request not wired yet", requestId);
  };

  const handleDeclineRequest = (requestId: string) => {
    console.warn("decline request not wired yet", requestId);
  };

  const sectionTitle: Record<Section, string> = {
    requests: "Requests",
    chats: "Messages",
    profile: "Profile",
    settings: "Settings",
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
        return <ChatsPreview />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  return (
    <Sidebar
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      requestCount={inboxCount}
      unreadCount={unreadCount}
      onLogout={auth.logout}
    >
      <div className="min-h-[calc(100vh-3rem)] bg-background p-4 md:p-6">
        <div className="mb-4 text-sm font-semibold text-foreground">
          {sectionTitle[activeSection]}
        </div>
        {renderContent()}
      </div>
    </Sidebar>
  );
}
