"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { ScrollArea } from "../ui/ScrollArea";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "../ui/Empty";
import type { Company } from "../../pages/CandidateDashboard";
import { CompanyProfileView } from "./candidate/CompanyProfileView";

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

interface ChatsViewProps {
  chats: any[]; // Changed to any[] to accept both Candidate and Company shapes
  onSendMessage: (chatId: string, content: string) => void;
  onMarkAsRead: (chatId: string) => void;
  isCompany?: boolean; // New optional flag
}

export function ChatsView({
  chats,
  onSendMessage,
  onMarkAsRead,
  isCompany = false,
}: ChatsViewProps) {
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [viewingCompany, setViewingCompany] = useState<{
    company: Company;
    role: string;
  } | null>(null);

  const handleOpenChat = (chat: any) => {
    setSelectedChat(chat);
    onMarkAsRead(chat.id);
  };

  const handleViewCompany = (company: Company, role: string) => {
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
        isCompany={isCompany}
        onBack={() => setSelectedChat(null)}
        onViewCompany={() =>
          handleViewCompany(selectedChat.company, selectedChat.role)
        }
        onSendMessage={(content) => onSendMessage(selectedChat.id, content)}
      />
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
          const name = isCompany ? chat.candidateName : chat.company?.name;
          const avatar = isCompany ? chat.candidateAvatar : chat.company?.logo;
          const initial = name ? name[0] : "?";

          const senderPrefix = chat.lastMessage.isFromCompany
            ? isCompany
              ? "You"
              : chat.recruiterName?.split(" ")[0] || "Recruiter"
            : isCompany
              ? chat.candidateName?.split(" ")[0] || "Candidate"
              : "You";

          return (
            <button
              key={chat.id}
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
                  {chat.unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                      {chat.unreadCount}
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
                      {formatRelativeTime(new Date(chat.lastMessage.createdAt))}
                    </span>
                  </div>

                  <p
                    className={`mt-1.5 text-sm truncate ${
                      chat.unreadCount > 0
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {senderPrefix}: {chat.lastMessage.content}
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
  chat: any;
  isCompany: boolean;
  onBack: () => void;
  onViewCompany: () => void;
  onSendMessage: (content: string) => void;
}

function ChatThread({
  chat,
  isCompany,
  onBack,
  onViewCompany,
  onSendMessage,
}: ChatThreadProps) {
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat.messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message.trim());
    setMessage("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const name = isCompany ? chat.candidateName : chat.company?.name;
  const avatar = isCompany ? chat.candidateAvatar : chat.company?.logo;
  const initial = name ? name[0] : "?";
  const subtitle = isCompany
    ? chat.role
    : `${chat.role} • ${chat.recruiterName}`;

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

        {!isCompany && (
          <Button variant="outline" size="sm" onClick={onViewCompany}>
            <BuildingIcon className="size-4" />
            <span className="hidden sm:inline">Company</span>
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4" ref={scrollRef}>
        <div className="mx-auto max-w-2xl space-y-3">
          {chat.messages.map((msg: any) => {
            // For companies, company messages are outgoing (right side).
            // For candidates, company messages are incoming (left side).
            const isIncoming = isCompany
              ? !msg.isFromCompany
              : msg.isFromCompany;

            return (
              <div
                key={msg.id}
                className={`flex ${isIncoming ? "justify-start" : "justify-end"}`}
              >
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
                  >
                    {formatMessageTime(new Date(msg.createdAt))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
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
