"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/Tabs";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/Avatar";
import { ScrollArea } from "../../ui/ScrollArea";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "../../ui/Empty";
import {
  mockRequests,
  mockChats,
  type Request,
  type Chat,
  type Company,
} from "../../../pages/CandidateDashboard";
import { CompanyProfileView } from "./CompanyProfileView";
import { ChatThread } from "../ChatThread";

// Icons
function InboxIcon({ className }: { className?: string }) {
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
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

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

function CheckIcon({ className }: { className?: string }) {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
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

export function CandidateInbox() {
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [viewingCompany, setViewingCompany] = useState<{
    company: Company;
    role: string;
  } | null>(null);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  const handleAcceptRequest = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    // Remove from requests
    setRequests((prev) => prev.filter((r) => r.id !== requestId));

    // Add to chats
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      company: request.company,
      role: request.role,
      recruiterName: request.recruiterName,
      recruiterTitle: request.recruiterTitle,
      lastMessage: {
        content: request.message,
        isFromCompany: true,
        createdAt: request.createdAt,
      },
      unreadCount: 0,
      messages: [
        {
          id: `msg-${Date.now()}`,
          content: request.message,
          isFromCompany: true,
          createdAt: request.createdAt,
        },
      ],
    };
    setChats((prev) => [newChat, ...prev]);
  };

  const handleDeclineRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const handleViewCompany = (company: Company, role: string) => {
    setViewingCompany({ company, role });
  };

  const handleOpenChat = (chat: Chat) => {
    setSelectedChat(chat);
    // Mark as read
    setChats((prev) =>
      prev.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c)),
    );
  };

  const handleSendMessage = (chatId: string, content: string) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== chatId) return chat;
        const newMessage = {
          id: `msg-${Date.now()}`,
          content,
          isFromCompany: false,
          createdAt: new Date(),
        };
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: {
            content,
            isFromCompany: false,
            createdAt: new Date(),
          },
        };
      }),
    );
    // Update selectedChat if it's the active one
    if (selectedChat?.id === chatId) {
      setSelectedChat((prev) => {
        if (!prev) return null;
        const newMessage = {
          id: `msg-${Date.now()}`,
          content,
          isFromCompany: false,
          createdAt: new Date(),
        };
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
          lastMessage: {
            content,
            isFromCompany: false,
            createdAt: new Date(),
          },
        };
      });
    }
  };

  // If viewing a chat thread
  if (selectedChat) {
    return (
      <ChatThread
        chat={selectedChat}
        onBack={() => setSelectedChat(null)}
        onViewCompany={() =>
          handleViewCompany(selectedChat.company, selectedChat.role)
        }
        onSendMessage={(content) => handleSendMessage(selectedChat.id, content)}
      />
    );
  }

  // If viewing a company profile
  if (viewingCompany) {
    return (
      <CompanyProfileView
        company={viewingCompany.company}
        role={viewingCompany.role}
        onClose={() => setViewingCompany(null)}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="requests" className="flex h-full flex-col">
        <div className="border-b border-border px-4 lg:px-6">
          <TabsList className="h-auto bg-transparent p-0">
            <TabsTrigger
              value="requests"
              className="relative rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Requests
              {pendingRequests.length > 0 && (
                <Badge className="ml-2" variant="default">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="chats"
              className="relative rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Chats
              {totalUnread > 0 && (
                <Badge className="ml-2" variant="default">
                  {totalUnread}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="requests" className="mt-0 flex-1">
          {pendingRequests.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6">
              <Empty className="border-none">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <InboxIcon className="size-5" />
                  </EmptyMedia>
                  <EmptyTitle>No requests yet</EmptyTitle>
                  <EmptyDescription>
                    Companies will reach out when they find your profile
                    interesting. In the meantime, make sure your profile is
                    complete.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="divide-y divide-border">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 lg:p-6 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="size-12 shrink-0">
                        <AvatarImage src={request.company.logo} />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {request.company.name[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <button
                              onClick={() =>
                                handleViewCompany(request.company, request.role)
                              }
                              className="text-sm font-semibold text-foreground hover:underline text-left"
                            >
                              {request.company.name}
                            </button>
                            <p className="text-sm text-muted-foreground">
                              {request.role}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatRelativeTime(request.createdAt)}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-foreground line-clamp-2">
                          {request.message}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          From {request.recruiterName}, {request.recruiterTitle}
                        </p>

                        <div className="mt-4 flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                          >
                            <CheckIcon className="size-4" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineRequest(request.id)}
                          >
                            <XIcon className="size-4" />
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleViewCompany(request.company, request.role)
                            }
                          >
                            <BuildingIcon className="size-4" />
                            View Company
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="chats" className="mt-0 flex-1">
          {chats.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6">
              <Empty className="border-none">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MessageSquareIcon className="size-5" />
                  </EmptyMedia>
                  <EmptyTitle>No conversations</EmptyTitle>
                  <EmptyDescription>
                    Accept a company request to start chatting. Your
                    conversations will appear here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="divide-y divide-border">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleOpenChat(chat)}
                    className="w-full p-4 lg:p-6 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar className="size-12 shrink-0">
                          <AvatarImage src={chat.company.logo} />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {chat.company.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        {chat.unreadCount > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span
                              className={`text-sm font-semibold ${chat.unreadCount > 0 ? "text-foreground" : "text-foreground"}`}
                            >
                              {chat.company.name}
                            </span>
                            <p className="text-sm text-muted-foreground">
                              {chat.role}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatRelativeTime(chat.lastMessage.createdAt)}
                          </span>
                        </div>

                        <p
                          className={`mt-1 text-sm truncate ${chat.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}
                        >
                          {chat.lastMessage.isFromCompany
                            ? chat.recruiterName.split(" ")[0]
                            : "You"}
                          : {chat.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
