"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { Sidebar } from "../components/ui/Sidebar";
import CandidateSearch from "../components/sections/company/CandidateSearch";
import CompanyInbox from "../components/sections/company/CompanyInbox";
import { ChatsView } from "../components/sections/ChatsView";
import CompanyProfile from "../components/sections/company/CompanyProfile";
import CompanySettings from "../components/sections/company/CompanySettings";
import RecruitingProfiles from "../components/sections/company/RecruitingProfiles";

export type Section =
  | "search"
  | "inbox"
  | "chats"
  | "job-offers"
  | "profile"
  | "settings";

export default function CompanyDashboard() {
  const auth = useAuth();
  const { inboxCount, unreadCount, loading, error } = useUser();
  const [activeSection, setActiveSection] = useState<Section>("search");
  const [interestedIds, setInterestedIds] = useState<string[]>([]);

  if (!auth.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 text-center text-sm text-foreground">
        Please sign in to see your company dashboard.
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

  const handleInterested = (id: string) => {
    setInterestedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const sectionTitle: Record<Section, string> = {
    search: "Candidate Search",
    inbox: "Inbox",
    chats: "Messages",
    "job-offers": "Job Offers",
    profile: "Company Profile",
    settings: "Settings",
  };

  const renderContent = () => {
    switch (activeSection) {
      case "search":
        return (
          <CandidateSearch
            onInterested={handleInterested}
            interestedIds={interestedIds}
          />
        );
      case "inbox":
        return <CompanyInbox onOpenChat={() => setActiveSection("chats")} />;
      case "chats":
        return <ChatsView isCompany={true} />;
      case "job-offers":
        return (
          <div className="mx-auto max-w-2xl">
            <RecruitingProfiles />
          </div>
        );
      case "profile":
        return <CompanyProfile />;
      case "settings":
        return <CompanySettings />;
      default:
        return null;
    }
  };

  return (
    <Sidebar
      activeSection={activeSection as any}
      onSectionChange={setActiveSection as any}
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
