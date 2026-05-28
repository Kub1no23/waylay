"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import {
  Sidebar,
  type Section as SidebarSection,
} from "../components/ui/Sidebar";
import CandidateSearch from "../components/sections/company/CandidateSearch";
import CompanyInbox from "../components/sections/company/CompanyInbox";
import CompanyAccount from "../components/sections/company/CompanyAccount";
import CompanySettings from "../components/sections/company/CompanySettings";
import RecruitingProfiles from "../components/sections/company/RecruitingProfiles";
import ChatsPreview from "../components/sections/ChatsPreview";

type Section =
  | "search"
  | "inbox"
  | "chats"
  | "job-offers"
  | "profile"
  | "settings";

const SECTION_TITLES: Record<Section, string> = {
  search: "Candidate Search",
  inbox: "Inbox",
  chats: "Messages",
  "job-offers": "Job Offers",
  profile: "Company Profile",
  settings: "Settings",
};

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
    return <div>Loading authentication session...</div>; // custom spinner or skeleton UI
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

  return (
    <Sidebar
      role="company"
      activeSection={activeSection as SidebarSection}
      onSectionChange={(section) => setActiveSection(section as Section)}
      requestCount={inboxCount}
      unreadCount={unreadCount}
      onLogout={auth.logout}
    >
      <div className="min-h-[calc(100vh-3rem)] bg-background p-4 md:p-6">
        <div className="mb-4 text-sm font-semibold text-foreground">
          {SECTION_TITLES[activeSection]}
        </div>

        <main className="flex-1 overflow-auto">
          {activeSection === "search" && (
            <CandidateSearch
              onInterested={handleInterested}
              interestedIds={interestedIds}
            />
          )}

          {activeSection === "inbox" && (
            <CompanyInbox onOpenChat={() => setActiveSection("chats")} />
          )}

          {activeSection === "chats" && <ChatsPreview />}

          {activeSection === "job-offers" && (
            <div className="mx-auto max-w-2xl">
              <RecruitingProfiles />
            </div>
          )}

          {activeSection === "profile" && <CompanyAccount />}

          {activeSection === "settings" && <CompanySettings />}
        </main>
      </div>
    </Sidebar>
  );
}
