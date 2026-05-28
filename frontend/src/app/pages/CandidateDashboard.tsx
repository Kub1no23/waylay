"use client";

import { useState } from "react";
import { useNavigate } from "react-router"; // 👈 React Router v7 navigation engine
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import {
  Sidebar,
  type Section as SidebarSection,
} from "../components/ui/Sidebar";

// Section imports
import { CandidateInbox } from "../components/sections/candidate/CandidateInbox";
import ChatsPreview from "../components/sections/ChatsPreview";
import CandidateAccount from "../components/sections/candidate/CandidateAccount";
import { CandidateSettings } from "../components/sections/candidate/CandidateSettings";
import CandidateJobProfile from "../components/sections/candidate/CandidateJobProfile";

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

// Define local matching Section bounds
type CandidateSection =
  | "requests"
  | "chats"
  | "job-profile"
  | "profile"
  | "settings";

const SECTION_TITLES: Record<CandidateSection, string> = {
  requests: "Requests",
  chats: "Messages",
  "job-profile": "Job Profile & Matcher", // 👈 Added section title mapping
  profile: "Candidate Account", // 👈 Updated to Candidate Account title
  settings: "Settings",
};

export default function CandidateDashboard() {
  const auth = useAuth();
  const navigate = useNavigate(); // 👈 Initialize routing hook
  const { inboxCount, unreadCount, loading, error } = useUser();
  const [activeSection, setActiveSection] =
    useState<CandidateSection>("requests");

  // Smoothly clean context and move back to landing path
  const handleLogout = () => {
    auth.logout();
    navigate("/", { replace: true });
  };

  // Route authorization gate
  if (!auth.isAuthenticated) {
    navigate("/", { replace: true });
    return null;
  }

  if (loading) {
    return <div>Loading authentication session...</div>;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 text-center text-sm text-foreground">
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <Sidebar
      role="candidate"
      activeSection={activeSection as SidebarSection}
      onSectionChange={(section) =>
        setActiveSection(section as CandidateSection)
      }
      requestCount={inboxCount}
      unreadCount={unreadCount}
      onLogout={handleLogout} // Using corrected logout sequence handler
    >
      <div className="min-h-[calc(100vh-3rem)] bg-background p-4 md:p-6">
        <div className="mb-4 text-sm font-semibold text-foreground">
          {SECTION_TITLES[activeSection]}
        </div>

        <main className="flex-1 overflow-auto">
          {activeSection === "requests" && <CandidateInbox />}

          {activeSection === "chats" && <ChatsPreview />}

          {/* 👈 New matching profile section rendered directly under messaging groups */}
          {activeSection === "job-profile" && <CandidateJobProfile />}

          {/* 👈 Updated to point to CandidateAccount instead of legacy profile */}
          {activeSection === "profile" && <CandidateAccount />}

          {activeSection === "settings" && <CandidateSettings />}
        </main>
      </div>
    </Sidebar>
  );
}
