"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "../ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { ScrollArea } from "../ui/ScrollArea";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "../ui/Empty";
import { Eye as EyeIcon } from "lucide-react";
import type { Company } from "../../pages/CandidateDashboard";
import { CompanyProfileView } from "./candidate/CompanyProfileView";
import { useAuth } from "../../../api/AuthContext";
import { API } from "../../../api/auth";
import { useUser } from "../../../context/UserContext";
import ChatThread from "./ChatThread";

// Icons
function MessageSquareIcon({ className }: { className?: string }) {
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
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
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
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
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
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
      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <path d="m21.854 2.147-10.94 10.939" />
    </svg>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function formatMessageTime(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isYesterday) {
    return `Yesterday ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

interface LatestChatMessage {
  id: number;
  sender: number;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface ChatPreview {
  chatId: number;
  latestMessage?: LatestChatMessage | null;
  createdAt: string;
  updatedAt: string;
  displayName?: string;
  avatarUrl?: string;
  role?: string;
  unreadCount?: number;
  otherUserId?: number;
  recruiterName?: string;
  company?: Company;
  candidateName?: string;
  candidateAvatar?: string;
}

interface NormalizedMessage {
  id: number;
  sender: number;
  content: string;
  createdAt: string;
  isRead: boolean;
}

// Exact backend response shape for GET /chat/{id}
interface Message {
  Id: number;
  Sender: number;
  Content: string;
  CreatedAt: string;
  IsRead: boolean;
}

interface ChatHistory {
  chatId: number;
  CreatedAt: string;
  UpdatedAt: string;
  Messages: Message[];
}

interface ChatsViewProps {
  isCompany?: boolean;
}

export function ChatsView({ isCompany = false }: ChatsViewProps) {
  const auth = useAuth();
  const { connection, setUnreadCount } = useUser();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatHistory | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<ChatPreview | null>(null);
  const [typingState, setTypingState] = useState<{ chatId: number; sender: number; expiresAt: number } | null>(null);
  const [viewingCompany, setViewingCompany] = useState<{
    company: Company;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      setLoading(false);
      return;
    }

    void loadChatPreviews();
  }, [auth.isAuthenticated, auth.role]);

  useEffect(() => {
    if (!connection || !auth.userId) return;
    // Helper: normalize incoming payload into Message-like shape
    const normalizePayloadToMessage = (payload: any) => {
      const chatIdRaw = payload?.chatId ?? payload?.ChatId;
      const chatId = typeof chatIdRaw === "string" ? parseInt(chatIdRaw, 10) : chatIdRaw;
      const sender = payload?.sender ?? payload?.SenderId ?? payload?.Sender;
      const content = payload?.content ?? payload?.Text ?? payload?.Content ?? "";
      const createdAt = payload?.createdAt ?? payload?.Timestamp ?? payload?.CreatedAt ?? new Date().toISOString();
      const id = payload?.id ?? payload?.Id ?? `${chatId}-${sender}-${createdAt}`;

      return {
        chatId,
        message: {
          Id: id,
          Sender: sender,
          Content: content,
          CreatedAt: createdAt,
          IsRead: payload?.isRead ?? false,
        } as any,
      };
    };

    // Helper: append message to lists and selected chat atomically
    const appendIncomingMessage = (chatId: number, msg: Message) => {
      // update chats list preview
      setChats((prev) =>
        prev.map((c) =>
          c.chatId === chatId
            ? {
              ...c,
              latestMessage: {
                id: (msg as any).Id,
                sender: msg.Sender,
                content: msg.Content,
                createdAt: msg.CreatedAt,
                isRead: msg.IsRead ?? false,
              },
              updatedAt: msg.CreatedAt,
            }
            : c,
        ),
      );

      // update selectedPreview
      setSelectedPreview((prev) => {
        if (!prev || prev.chatId !== chatId) return prev;
        return {
          ...prev,
          latestMessage: {
            id: (msg as any).Id,
            sender: msg.Sender,
            content: msg.Content,
            createdAt: msg.CreatedAt,
            isRead: msg.IsRead ?? false,
          },
        } as ChatPreview;
      });

      // update selected chat messages if open
      setSelectedChat((prev) => {
        if (!prev || prev.chatId !== chatId) return prev;

        // dedupe by Id
        const existing = ((prev as any).Messages ?? []).some((m: any) => String(m.Id) === String((msg as any).Id));
        if (existing) return prev;

        return {
          ...prev,
          Messages: [...((prev as any).Messages ?? []), msg as any],
        } as ChatHistory;
      });
    };

    const handleReceiveMessage = (payload: any) => {
      const { chatId, message } = normalizePayloadToMessage(payload);
      if (!chatId) return;

      // Always update preview/chats list
      appendIncomingMessage(chatId, message);

      // If the chat is open, mark read and decrement global unread
      if (selectedChat && selectedChat.chatId === chatId) {
        try {
          setUnreadCount((count) => Math.max(0, count - 1));
        } catch (e) { }
        void markMessagesAsRead(chatId);
      }
    };

    const handleTypingSignal = (chatId: number, senderId: number, isTyping: boolean) => {
      if (senderId === auth.userId) return;

      if (!isTyping) {
        setTypingState((prev) =>
          prev && prev.chatId === chatId && prev.sender === senderId ? null : prev,
        );
        return;
      }

      setTypingState({
        chatId,
        sender: senderId,
        expiresAt: Date.now() + 3000,
      });
    };

    const handleReadReceipt = (chatId: number, readerId: number) => {
      if (readerId === auth.userId) return;

      setSelectedChat((prev) => {
        if (!prev || prev.chatId !== chatId) return prev;

        const updatedMessages = ((prev as any).Messages ?? []).map((m: any) => {
          const sender = m.Sender ?? m.sender;
          const isRead = m.IsRead ?? m.isRead;
          if (sender === auth.userId && !isRead) {
            return {
              ...m,
              IsRead: true,
              isRead: true,
            };
          }
          return m;
        });

        return {
          ...prev,
          Messages: updatedMessages,
        } as ChatHistory;
      });

      setSelectedPreview((prev) => {
        if (!prev || prev.chatId !== chatId) return prev;
        if (prev.latestMessage?.sender !== auth.userId) return prev;
        return {
          ...prev,
          latestMessage: {
            ...prev.latestMessage,
            isRead: true,
          },
        };
      });

      setChats((prev) =>
        prev.map((chat) =>
          chat.chatId === chatId && chat.latestMessage?.sender === auth.userId
            ? {
              ...chat,
              latestMessage: {
                ...chat.latestMessage,
                isRead: true,
              },
            }
            : chat,
        ),
      );
    };

    connection.on("ReceiveMessage", handleReceiveMessage);
    connection.on("ReceiveTypingSignal", handleTypingSignal);
    connection.on("ReceiveReadReceipt", handleReadReceipt);

    return () => {
      connection.off("ReceiveMessage", handleReceiveMessage);
      connection.off("ReceiveTypingSignal", handleTypingSignal);
      connection.off("ReceiveReadReceipt", handleReadReceipt);
    };
  }, [connection, auth.userId, selectedChat?.chatId]);

  useEffect(() => {
    if (!typingState) return;

    const timeout = window.setTimeout(() => {
      setTypingState((prev) =>
        prev && prev.chatId === typingState.chatId && prev.sender === typingState.sender
          ? null
          : prev,
      );
    }, typingState.expiresAt - Date.now());

    return () => window.clearTimeout(timeout);
  }, [typingState]);

  const loadChatPreviews = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await API.get<any[]>("/chat");
      console.log("Loaded chat previews:", response.data);

      const raw = response.data ?? [];
      const mapped: ChatPreview[] = raw.map((item: any) => {
        if (auth.role === "candidate") {
          return {
            chatId: item.chatId,
            latestMessage: item.latestMessage,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            company: item.companyId ? { id: item.companyId, name: item.companyName } as any : undefined,
            otherUserId: item.companyId,
            displayName: item.companyName,
            role: "company",
          };
        }

        if (auth.role === "company") {
          return {
            chatId: item.chatId,
            latestMessage: item.latestMessage,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            candidateName: item.candidateName,
            otherUserId: item.candidateId,
            displayName: item.candidateName,
            role: "candidate",
          };
        }

        return item as ChatPreview;
      });

      setChats(mapped);
    } catch (err) {
      console.error("Failed to load chats", err);
      setError(err instanceof Error ? err.message : "Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async (chatId: number): Promise<ChatHistory | null> => {
    setError(null);

    try {
      const response = await API.get<ChatHistory>(`/chat/${chatId}`);
      const data = response.data;
      console.log(data);

      // Count unread messages and decrease unread count
      if (data && data.Messages) {
        const unreadCount = data.Messages.filter(
          (msg) => !msg.IsRead && msg.Sender !== auth.userId
        ).length;

        if (unreadCount > 0) {
          setUnreadCount((count) => Math.max(0, count - unreadCount));
        }
      }

      return data ?? null;
    } catch (err) {
      console.error("Failed to load chat history", err);
      setError(err instanceof Error ? err.message : "Failed to load chat history");
      return null;
    } finally {
    }
  };

  const markMessagesAsRead = async (chatId: number) => {
    try {
      await API.post(`/chat/${chatId}/read`);
      try {
        if (connection?.state === "Connected") {
          await connection.invoke("SendReadReceipt", String(chatId));
        } else {
          console.warn("Hub not connected, skipping SendReadReceipt");
        }
      } catch (wsErr) {
        console.error("Failed to send read receipt via hub", wsErr);
      }
      setChats((prev) =>
        prev.map((chat) =>
          chat.chatId === chatId
            ? {
              ...chat,
              unreadCount: 0,
              latestMessage: chat.latestMessage
                ? { ...chat.latestMessage, isRead: true }
                : chat.latestMessage,
            }
            : chat,
        ),
      );
    } catch (err) {
      console.error("Failed to mark messages as read", err);
    }
  };

  const handleOpenChat = async (chat: ChatPreview) => {
    setSelectedPreview(chat);
    await markMessagesAsRead(chat.chatId);
    const history = await loadChatHistory(chat.chatId);
    setSelectedChat(history);
  };

  const getTargetUserId = (chat: any) => {
    if (chat.otherUserId) {
      return chat.otherUserId;
    }

    if (!auth.userId) {
      return undefined;
    }

    const raw = (chat as any).messages ?? (chat as any).Messages ?? [];
    const msgs: NormalizedMessage[] = raw.map((m: any) => ({
      id: m.id ?? m.Id,
      sender: m.sender ?? m.Sender,
      content: m.content ?? m.Content,
      createdAt: m.createdAt ?? m.CreatedAt,
      isRead: m.isRead ?? m.IsRead ?? false,
    }));

    return msgs.find((msg) => msg.sender !== auth.userId)?.sender;
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChat) {
      return;
    }
    if (!auth.userId) {
      setError("Unable to resolve current user.");
      return;
    }

    const targetUserId = getTargetUserId(selectedPreview ?? selectedChat);
    if (!targetUserId) {
      setError("Unable to resolve chat recipient.");
      return;
    }

    try {
      const response = await API.post(`/chat/user/${targetUserId}`, {
        content,
      });
      const sentMessage = response.data?.data ?? response.data;

      if (sentMessage) {
        setSelectedChat((prev) => {
          if (!prev) return prev;

          // backend-shaped chat uses `Messages` array
          if ((prev as any).Messages) {
            return {
              ...(prev as any),
              Messages: [...(prev as any).Messages, sentMessage],
            } as ChatHistory;
          }

          // fallback for normalized shape
          return {
            ...(prev as any),
            messages: [...(prev as any).messages, sentMessage],
            latestMessage: sentMessage,
            updatedAt: sentMessage.createdAt,
          } as any;
        });
        setChats((prev) =>
          prev.map((c) =>
            c.chatId === (selectedPreview?.chatId ?? selectedChat?.chatId)
              ? {
                ...c,
                latestMessage: sentMessage,
                updatedAt: sentMessage.createdAt,
              }
              : c,
          ),
        );

        // Broadcast via websocket to ensure real-time delivery
        try {
          if (connection?.state === "Connected") {
            await connection.invoke("SendMessage", String(selectedPreview?.chatId ?? selectedChat?.chatId), content);
          }
        } catch (wsErr) {
          console.warn("Failed to broadcast message via websocket", wsErr);
        }

        setError(null);
      }
    } catch (err) {
      console.error("Failed to send message", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  const handleViewCompany = (company: Company | undefined, role: string) => {
    if (!company) return;
    setViewingCompany({ company, role });
  };

  if (viewingCompany) {
    return (
      <CompanyProfileView
        company={viewingCompany.company}
        role={viewingCompany.role}
        onClose={() => setViewingCompany(null)}
      />
    );
  }

  if (selectedChat) {
    return (
      <ChatThread
        chat={selectedChat}
        preview={selectedPreview}
        typingState={typingState}
        isCompany={isCompany}
        onBack={() => { setSelectedChat(null); setSelectedPreview(null); }}
        onViewCompany={() =>
          handleViewCompany(selectedPreview?.company, selectedPreview?.role ?? "")
        }
        onSendMessage={handleSendMessage}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
        Loading conversations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-sm text-foreground">
        <p>{error}</p>
        <Button onClick={loadChatPreviews}>Retry</Button>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Empty className="border-none bg-transparent">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquareIcon className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No conversations</EmptyTitle>
            <EmptyDescription>
              Conversations will appear here once active.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="grid gap-2 p-4 lg:p-6">
        {chats.map((chat) => {
          const name = isCompany
            ? chat.candidateName ?? chat.displayName ?? `Chat ${chat.chatId}`
            : chat.company?.name ?? chat.displayName ?? `Chat ${chat.chatId}`;
          const avatar = isCompany ? chat.candidateAvatar ?? chat.avatarUrl : chat.company?.logo ?? chat.avatarUrl;
          const initial = name ? name[0] : "?";
          const unreadCount = chat.unreadCount ?? (chat.latestMessage && !chat.latestMessage.isRead ? 1 : 0);
          const previewDate = chat.latestMessage?.createdAt ?? chat.updatedAt;
          const isTypingPreview = typingState?.chatId === chat.chatId;

          const senderPrefix = isTypingPreview
            ? "User"
            : chat.latestMessage?.sender === auth.userId
              ? "You"
              : isCompany
                ? chat.candidateName?.split(" ")[0] || "Candidate"
                : chat.recruiterName?.split(" ")[0] || "Recruiter";

          return (
            <button
              key={chat.chatId}
              onClick={() => handleOpenChat(chat)}
              className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="size-11 shrink-0 border border-border">
                    <AvatarImage src={avatar} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                      {unreadCount}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {name}
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {chat.role}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(new Date(previewDate))}
                    </span>
                  </div>

                  <p
                    className={`mt-1.5 text-sm truncate ${unreadCount > 0 || isTypingPreview
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                      }`}
                  >
                    {senderPrefix}: {isTypingPreview ? "User is typing..." : chat.latestMessage?.content ?? "No messages yet"}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}

// ChatThread moved to separate file (ChatThread.tsx)
