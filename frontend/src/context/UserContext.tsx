import React, { createContext, useContext, useEffect, useState } from "react";
<<<<<<< HEAD
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useAuth } from "./AuthContext";
=======
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useAuth } from "../api/AuthContext";
>>>>>>> 562cb7f9f29f702a0a6fae02338f933dfcbe7e24
import { API } from "../api/auth";

interface UserProfile {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  location?: string;
  headline?: string;
  summary?: string;
  headquarters?: string;
  address?: string;
  industry?: string;
  description?: string;
}

interface MatchStatus {
  statusId: number;
  pending: boolean;
  createdAt: string;
  updatedAt: string;
}

<<<<<<< HEAD
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

type UserContextType = {
  userProfile: UserProfile | null;
  inboxCount: number;
  unreadCount: number;
  loading: boolean;
  error: string | null;
=======
type UserContextType = {
    userProfile: UserProfile | null;
    inboxCount: number;
    unreadCount: number;
    loading: boolean;
    error: string | null;
    connection: HubConnection | null;
>>>>>>> 562cb7f9f29f702a0a6fae02338f933dfcbe7e24
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
<<<<<<< HEAD
  const auth = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [inboxCount, setInboxCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
=======
    const auth = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [inboxCount, setInboxCount] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connection, setConnection] = useState<HubConnection | null>(null);
>>>>>>> 562cb7f9f29f702a0a6fae02338f933dfcbe7e24

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.userId || !auth.role) {
      setLoading(false);
      return;
    }

    const baseUrl = (API.defaults.baseURL ?? "").replace(/\/api$/, "");
    const hubUrl = baseUrl ? `${baseUrl}/api/hub/chat` : "/api/hub/chat";

    let connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => auth.token ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();
    connection.on("ReceiveMessage", (payload: unknown) => {
      console.log("ReceiveMessage", payload);
      setUnreadCount((count) => count + 1);
    });
    connection.on("Notification_Match", (payload: unknown) => {
      console.log("Notification_Match", payload);
      setInboxCount((count) => count + 1);
    });

    const loadUserData = async () => {
      try {
        // Fetch user profile based on role
        const profileEndpoint =
          auth.role === "candidate"
            ? `/user/candidate/${auth.userId}`
            : `/user/company/${auth.userId}`;

        const profileResponse = await API.get<UserProfile>(profileEndpoint);
        setUserProfile(profileResponse.data);

        // Fetch match and chat counts
        const [matchResponse, chatResponse] = await Promise.all([
          API.get<MatchStatus[]>("/match"),
          API.get<ChatSummary[]>("/chat"),
        ]);

        if (matchResponse.data) {
          const pendingMatches = matchResponse.data.filter(
            (match) => match.pending,
          );
          setInboxCount(pendingMatches.length);
        }

        if (chatResponse.data) {
          const unreadChats = chatResponse.data.reduce((sum, chat) => {
            return (
              sum + (chat.latestMessage && !chat.latestMessage.isRead ? 1 : 0)
            );
          }, 0);
          setUnreadCount(unreadChats);
        }

<<<<<<< HEAD
        setError(null);
      } catch (err) {
        console.error("Failed to load user data", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
=======
        let conn = new HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => auth.token ?? "",
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();
        conn.on("ReceiveMessage", (payload: unknown) => {
            console.log("ReceiveMessage", payload);
            setUnreadCount((count) => count + 1);
        });
        conn.on("Notification_Match", (payload: unknown) => {
            console.log("Notification_Match", payload);
            setInboxCount((count) => count + 1);
        });
        setConnection(conn);
>>>>>>> 562cb7f9f29f702a0a6fae02338f933dfcbe7e24

    const startHub = async () => {
      try {
        await connection.start();
        console.log("Chat hub connected");
      } catch (err) {
        console.error("Chat hub connection failed", err);
      }
    };

    void startHub();
    void loadUserData();

<<<<<<< HEAD
    return () => {
      void connection.stop().catch((err: unknown) => {
        console.error("Chat hub disconnect failed", err);
      });
    };
  }, [auth.isAuthenticated, auth.userId, auth.role, auth.token]);

  return (
    <UserContext.Provider
      value={{
        userProfile,
        inboxCount,
        unreadCount,
        loading,
        error,
      }}
    >
      {children}
    </UserContext.Provider>
  );
=======
                // Fetch match and unread chat counts
                const [matchResponse, chatCountResponse] = await Promise.all([
                    API.get<MatchStatus[]>("/match"),
                    API.get<{ count: number }>("/chat/count"),
                ]);

                if (matchResponse.data) {
                    const pendingMatches = matchResponse.data.filter(
                        (match) => match.pending
                    );
                    setInboxCount(pendingMatches.length);
                }

                if (chatCountResponse.data) {
                    setUnreadCount(chatCountResponse.data.count ?? 0);
                }

                setError(null);
            } catch (err) {
                console.error("Failed to load user data", err);
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        };

        const startHub = async () => {
            try {
                await conn.start();
                console.log("Chat hub connected");
            } catch (err) {
                console.error("Chat hub connection failed", err);
            }
        };

        void startHub();
        void loadUserData();

        return () => {
            void conn.stop().catch((err: unknown) => {
                console.error("Chat hub disconnect failed", err);
            });
            setConnection(null);
        };
    }, [auth.isAuthenticated, auth.userId, auth.role, auth.token]);

    return (
        <UserContext.Provider
            value={{
                userProfile,
                inboxCount,
                unreadCount,
                loading,
                error,
                connection,
            }}
        >
            {children}
        </UserContext.Provider>
    );
>>>>>>> 562cb7f9f29f702a0a6fae02338f933dfcbe7e24
}

export function useUser() {
  const ctx = useContext(UserContext);

  if (!ctx) {
    throw new Error("useUser must be used within UserProvider");
  }

  return ctx;
}
