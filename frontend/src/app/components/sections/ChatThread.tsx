"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "../ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { Eye as EyeIcon } from "lucide-react";
import { useAuth } from "../../../api/AuthContext";

interface Message {
    Id: number | string;
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

interface ChatPreview {
    chatId: number;
    latestMessage?: any;
    createdAt: string;
    updatedAt: string;
    displayName?: string;
    avatarUrl?: string;
    role?: string;
    unreadCount?: number;
    otherUserId?: number;
    recruiterName?: string;
    company?: any;
    candidateName?: string;
    candidateAvatar?: string;
}

interface NormalizedMessage {
    id: number | string;
    sender: number;
    content: string;
    createdAt: string;
    isRead: boolean;
}

interface ChatThreadProps {
    chat: ChatHistory;
    preview?: ChatPreview | null;
    typingState?: { chatId: number; sender: number; expiresAt: number } | null;
    isCompany: boolean;
    onBack: () => void;
    onViewCompany: () => void;
    onSendMessage: (content: string) => void;
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

export default function ChatThread({ chat, preview, typingState, isCompany, onBack, onViewCompany, onSendMessage }: ChatThreadProps) {
    const auth = useAuth();
    const currentUserId = auth.userId;
    const [message, setMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // normalize messages from backend-shaped or normalized chat
    const normalizedMessages: NormalizedMessage[] = ((chat as any).messages ?? (chat as any).Messages ?? []).map((m: any) => ({
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
            return msg.id as number;
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
        ? preview?.candidateName ?? preview?.displayName ?? `Chat ${chat.chatId}`
        : preview?.company?.name ?? preview?.displayName ?? `Chat ${chat.chatId}`;
    const avatar = isCompany ? preview?.candidateAvatar ?? preview?.avatarUrl : preview?.company?.logo ?? preview?.avatarUrl;
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
                    {normalizedMessages.map((msg: NormalizedMessage) => {
                        const isIncoming = currentUserId ? msg.sender !== currentUserId : true;

                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isIncoming ? "justify-start" : "justify-end"}`}
                            >
                                <div className="flex flex-col items-end gap-1">
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isIncoming
                                            ? "bg-card border border-border text-foreground rounded-bl-md"
                                            : "bg-primary text-primary-foreground rounded-br-md"
                                            }`}
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
