"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../api/AuthContext";
import { API } from "../../api/auth";
import { Sidebar, type Section } from "../components/ui/Sidebar";
import { CandidateProfile } from "../components/sections/candidate/CandidateProfile";
import { CandidateSettings } from "../components/sections/candidate/CandidateSettings";
import { CandidateInbox } from "../components/sections/candidate/CandidateInbox";
import { ChatsView } from "../components/sections/ChatsView";
import { useNavigate } from "react-router-dom";

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

interface MatchStatus {
  statusId: number;
  pending: boolean;
  createdAt: string;
  updatedAt: string;
  companyId: number;
}

interface LatestChatMessage {
  id: number;
  sender: number;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface ChatSummary {
  chatId: number;
  latestMessage?: LatestChatMessage | null;
  createdAt: string;
  updatedAt: string;
}

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("requests");
  const [requests] = useState<Request[]>([]);
  const [chats] = useState<Chat[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      setLoading(false);
      navigate("/login");
      return;
    }

    const loadDashboardCounts = async () => {
      try {
        const [matchResponse, chatResponse] = await Promise.all([
          API.get<MatchStatus[]>("/match"),
          API.get<ChatSummary[]>("/chat"),
        ]);

        if (matchResponse.data) {
          const pendingMatches = matchResponse.data.filter((match) => match.pending);
          setPendingCount(pendingMatches.length);
        }

        if (chatResponse.data) {
          const unreadChats = chatResponse.data.reduce((sum, chat) => {
            return sum + (chat.latestMessage && !chat.latestMessage.isRead ? 1 : 0);
          }, 0);
          setUnreadCount(unreadChats);
        }
      } catch (error) {
        console.error("Dashboard load failed", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardCounts();
  }, [auth.isAuthenticated]);

  const handleAcceptRequest = (requestId: string) => {
    console.warn("accept request not wired yet", requestId);
  };

  const handleDeclineRequest = (requestId: string) => {
    console.warn("decline request not wired yet", requestId);
  };

  const handleSendMessage = (chatId: string, content: string) => {
    console.warn("send message not wired yet", chatId, content);
  };

  const handleMarkChatAsRead = (chatId: string) => {
    console.warn("mark chat read not wired yet", chatId);
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
      requestCount={pendingCount}
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
