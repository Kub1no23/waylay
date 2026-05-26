import React, { createContext, useContext, useEffect, useState } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useAuth } from "../api/AuthContext";
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
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const auth = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [inboxCount, setInboxCount] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                        (match) => match.pending
                    );
                    setInboxCount(pendingMatches.length);
                }

                if (chatResponse.data) {
                    const unreadChats = chatResponse.data.reduce((sum, chat) => {
                        return sum + (chat.latestMessage && !chat.latestMessage.isRead ? 1 : 0);
                    }, 0);
                    setUnreadCount(unreadChats);
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
                await connection.start();
                console.log("Chat hub connected");
            } catch (err) {
                console.error("Chat hub connection failed", err);
            }
        };

        void startHub();
        void loadUserData();

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
}

export function useUser() {
    const ctx = useContext(UserContext);

    if (!ctx) {
        throw new Error("useUser must be used within UserProvider");
    }

    return ctx;
}
