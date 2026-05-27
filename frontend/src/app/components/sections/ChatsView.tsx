"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "../ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { ScrollArea } from "../ui/ScrollArea";
<<<<<<< HEAD
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "../ui/Empty";
=======
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "../ui/Empty";
import { Eye as EyeIcon } from "lucide-react";
>>>>>>> 562cb7f9f29f702a0a6fae02338f933dfcbe7e24
import type { Company } from "../../pages/CandidateDashboard";
import { CompanyProfileView } from "./candidate/CompanyProfileView";
import { useAuth } from "../../../context/AuthContext";
import { API } from "../../../api/auth";
import { useUser } from "../../../context/UserContext";

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

interface Message {
  id: number;
  sender: number;
  content: string;
  createdAt: string;
  isRead: boolean;
}

// Exact backend response shape for GET /chat/{id}
interface BackendMessage {
  Id: number;
  Sender: number;
  Content: string;
  CreatedAt: string;
  IsRead: boolean;
}

interface BackendChatHistory {
  chatId: number;
  CreatedAt: string;
  UpdatedAt: string;
  Messages: BackendMessage[];
}

interface ChatsViewProps {
  isCompany?: boolean;
}

export function ChatsView({ isCompany = false }: ChatsViewProps) {
  const auth = useAuth();
  const { connection } = useUser();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [selectedChat, setSelectedChat] = useState<BackendChatHistory | null>(null);
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
        } as BackendChatHistory;
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

    connection.on("ReceiveTypingSignal", handleTypingSignal);
    connection.on("ReceiveReadReceipt", handleReadReceipt);

    return () => {
      connection.off("ReceiveTypingSignal", handleTypingSignal);
      connection.off("ReceiveReadReceipt", handleReadReceipt);
    };
  }, [connection, auth.userId]);

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

  const loadChatHistory = async (chatId: number): Promise<BackendChatHistory | null> => {
    setError(null);

    try {
      const response = await API.get<BackendChatHistory>(`/chat/${chatId}`);
      return response.data ?? null;
    } catch (err) {
      console.error("Failed to load chat history", err);
      setError(
        err instanceof Error ? err.message : "Failed to load chat history",
      );
      return null;
    } finally {
    }
  };

  const markMessagesAsRead = async (chatId: number) => {
    try {
      await API.post(`/chat/${chatId}/read`);
      try {
        if (connection) {
          await connection.invoke("SendReadReceipt", String(chatId));
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
    const msgs: Message[] = raw.map((m: any) => ({
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
<<<<<<< HEAD
        setSelectedChat((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, sentMessage],
                latestMessage: sentMessage,
                updatedAt: sentMessage.createdAt,
              }
            : prev,
        );
=======
        setSelectedChat((prev) => {
          if (!prev) return prev;

          // backend-shaped chat uses `Messages` array
          if ((prev as any).Messages) {
            return {
              ...(prev as any),
              Messages: [...(prev as any).Messages, sentMessage],
            } as BackendChatHistory;
          }

          // fallback for normalized shape
          return {
            ...(prev as any),
            messages: [...(prev as any).messages, sentMessage],
            latestMessage: sentMessage,
            updatedAt: sentMessage.createdAt,
          } as any;
        });
>>>>>>> 562cb7f9f29f702a0a6fae02338f933dfcbe7e24
        setChats((prev) =>
          prev.map((c) =>
            c.chatId === (selectedPreview?.chatId ?? selectedChat?.chatId)
              ? {
<<<<<<< HEAD
                  ...chat,
                  latestMessage: sentMessage,
                  updatedAt: sentMessage.createdAt,
                }
              : chat,
=======
                ...c,
                latestMessage: sentMessage,
                updatedAt: sentMessage.createdAt,
              }
              : c,
>>>>>>> 562cb7f9f29f702a0a6fae02338f933dfcbe7e24
          ),
        );
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
            ? (chat.candidateName ?? chat.displayName ?? `Chat ${chat.chatId}`)
            : (chat.company?.name ?? chat.displayName ?? `Chat ${chat.chatId}`);
          const avatar = isCompany
            ? (chat.candidateAvatar ?? chat.avatarUrl)
            : (chat.company?.logo ?? chat.avatarUrl);
          const initial = name ? name[0] : "?";
          const unreadCount =
            chat.unreadCount ??
            (chat.latestMessage && !chat.latestMessage.isRead ? 1 : 0);
          const previewDate = chat.latestMessage?.createdAt ?? chat.updatedAt;
          const isTypingPreview = typingState?.chatId === chat.chatId;

<<<<<<< HEAD
          const senderPrefix =
            chat.latestMessage?.sender === auth.userId
=======
          const senderPrefix = isTypingPreview
            ? "User"
            : chat.latestMessage?.sender === auth.userId
>>>>>>> 562cb7f9f29f702a0a6fae02338f933dfcbe7e24
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
<<<<<<< HEAD
                    className={`mt-1.5 text-sm truncate ${
                      unreadCount > 0
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {senderPrefix}:{" "}
                    {chat.latestMessage?.content ?? "No messages yet"}
=======
                    className={`mt-1.5 text-sm truncate ${unreadCount > 0 || isTypingPreview
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                      }`}
                  >
                    {senderPrefix}: {isTypingPreview ? "User is typing..." : chat.latestMessage?.content ?? "No messages yet"}
>>>>>>> 562cb7f9f29f702a0a6fae02338f933dfcbe7e24
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

interface ChatThreadProps {
  chat: BackendChatHistory;
  preview?: ChatPreview | null;
  typingState?: { chatId: number; sender: number; expiresAt: number } | null;
  isCompany: boolean;
  onBack: () => void;
  onViewCompany: () => void;
  onSendMessage: (content: string) => void;
}

function ChatThread({
  chat,
  preview,
  typingState,
  isCompany,
  onBack,
  onViewCompany,
  onSendMessage,
}: ChatThreadProps) {
  const auth = useAuth();
  const currentUserId = auth.userId;
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // normalize messages from backend-shaped or normalized chat
  const normalizedMessages: Message[] = ((chat as any).messages ?? (chat as any).Messages ?? []).map((m: any) => ({
    id: m.id ?? m.Id,
    sender: m.sender ?? m.Sender,
    content: m.content ?? m.Content,
    createdAt: m.createdAt ?? m.CreatedAt,
    isRead: m.isRead ?? m.IsRead ?? false,
  }));

  const isTyping = typingState?.chatId === chat.chatId && typingState.sender !== currentUserId;
  const typingSeconds = isTyping
    ? Math.max(1, Math.ceil((typingState.expiresAt - Date.now()) / 1000))
    : 0;

  const lastReadOutgoingMessageId = normalizedMessages.reduce<number | null>((acc, msg) => {
    if (msg.sender === currentUserId && msg.isRead) {
      return msg.id;
    }
    return acc;
  }, null);

  const msgCount = normalizedMessages.length;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgCount]);

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message.trim());
    setMessage("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const name = isCompany
<<<<<<< HEAD
    ? (chat.candidateName ?? chat.displayName ?? `Chat ${chat.chatId}`)
    : (chat.company?.name ?? chat.displayName ?? `Chat ${chat.chatId}`);
  const avatar = isCompany
    ? (chat.candidateAvatar ?? chat.avatarUrl)
    : (chat.company?.logo ?? chat.avatarUrl);
=======
    ? preview?.candidateName ?? preview?.displayName ?? `Chat ${chat.chatId}`
    : preview?.company?.name ?? preview?.displayName ?? `Chat ${chat.chatId}`;
  const avatar = isCompany ? preview?.candidateAvatar ?? preview?.avatarUrl : preview?.company?.logo ?? preview?.avatarUrl;
>>>>>>> 562cb7f9f29f702a0a6fae02338f933dfcbe7e24
  const initial = name ? name[0] : "?";
  const subtitle = preview?.role
    ? isCompany
      ? preview.role
      : `${preview.role}${preview.recruiterName ? ` • ${preview.recruiterName}` : ""}`
    : "Conversation";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeftIcon className="size-4" />
          <span className="sr-only">Back to chats</span>
        </Button>

        <Avatar className="size-9 shrink-0 border border-border">
          <AvatarImage src={avatar} />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            {initial}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-foreground truncate">
            {name}
          </h2>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>

        {!isCompany && preview?.company?.name && (
          <Button variant="outline" size="sm" onClick={onViewCompany}>
            <BuildingIcon className="size-4" />
            <span className="hidden sm:inline">Company</span>
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4" ref={scrollRef}>
        <div className="mx-auto max-w-2xl space-y-3">
<<<<<<< HEAD
          {chat.messages.map((msg: Message) => {
            const isIncoming = currentUserId
              ? msg.sender !== currentUserId
              : true;
=======
          {normalizedMessages.map((msg: Message) => {
            const isIncoming = currentUserId ? msg.sender !== currentUserId : true;
>>>>>>> 562cb7f9f29f702a0a6fae02338f933dfcbe7e24

            return (
              <div
                key={msg.id}
                className={`flex ${isIncoming ? "justify-start" : "justify-end"}`}
              >
<<<<<<< HEAD
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    isIncoming
                      ? "bg-card border border-border text-foreground rounded-bl-md"
                      : "bg-primary text-primary-foreground rounded-br-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                  <p
                    className={`mt-1.5 text-[10px] ${
                      isIncoming
                        ? "text-muted-foreground"
                        : "text-primary-foreground/70"
                    }`}
=======
                <div className="flex flex-col items-end gap-1">
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isIncoming
                      ? "bg-card border border-border text-foreground rounded-bl-md"
                      : "bg-primary text-primary-foreground rounded-br-md"
                      }`}
>>>>>>> 562cb7f9f29f702a0a6fae02338f933dfcbe7e24
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                    <p
                      className={`mt-1.5 text-[10px] ${isIncoming
                        ? "text-muted-foreground"
                        : "text-primary-foreground/70"
                        }`}
                    >
                      {formatMessageTime(new Date(msg.createdAt))}
                    </p>
                  </div>
                  {!isIncoming && msg.id === lastReadOutgoingMessageId && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <EyeIcon className="size-3" />
                      <span>Seen</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {isTyping && (
          <div className="mx-auto mt-3 max-w-2xl rounded-2xl border border-border bg-muted p-3 text-sm text-muted-foreground">
            User is typing for {typingSeconds}s
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-border bg-card p-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 max-h-32"
              style={{
                height: "auto",
                minHeight: "48px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              className="shrink-0 h-12 w-12 rounded-xl"
              size="icon"
            >
              <SendIcon className="size-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
