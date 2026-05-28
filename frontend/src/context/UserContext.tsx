import React, { createContext, useContext, useEffect, useState } from "react";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
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

type UserContextType = {
    userProfile: UserProfile | null;
    inboxCount: number;
    unreadCount: number;
    loading: boolean;
    error: string | null;
    connection: HubConnection | null;
    setUnreadCount: (value: number | ((count: number) => number)) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const auth = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [inboxCount, setInboxCount] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [processedMessageIds, setProcessedMessageIds] = useState<number[]>([]);
    const [processedMatchIds, setProcessedMatchIds] = useState<number[]>([]);

    useEffect(() => {
        if (!auth.isAuthenticated || !auth.userId || !auth.role) {
            setLoading(false);
            return;
        }

        const baseUrl = (API.defaults.baseURL ?? "").replace(/\/api$/, "");
        const hubUrl = baseUrl ? `${baseUrl}/api/hub/chat` : "/api/hub/chat";

        let conn = new HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => auth.token ?? "",
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();
        conn.on("ReceiveMessage", (payload: any) => {
            console.log("ReceiveMessage", payload);
            setProcessedMessageIds((prevIds) => {
                if (prevIds.includes(payload.chatId)) {
                    return prevIds;
                }

                setUnreadCount((count) => count + 1);
                return [...prevIds, payload.chatId];
            });
        });
        conn.on("Notification_Match", (payload: any) => {
            console.log("Notification_Match", payload);
            setProcessedMatchIds((prevIds) => {
                if (prevIds.includes(payload.chatId)) {
                    return prevIds;
                }

                setInboxCount((count) => count - 1);
                return [...prevIds, payload.chatId];
            });
        });

        // Ensure we handle read receipts client-side to avoid server warnings
        conn.on("ReceiveReadReceipt", (chatId: unknown, readerId: unknown) => {
            console.log("ReceiveReadReceipt", chatId, readerId);
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
                setConnection(conn);
            } catch (err) {
                console.error("Chat hub connection failed", err);
                setConnection(null);
            }
        };

        void startHub();
        void loadUserData();

        return () => {
            void connection?.stop().catch((err: unknown) => {
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
                setUnreadCount,
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
