import { useEffect, useState } from "react";
import { API } from "../../../api/auth";
import { useAuth } from "../../../context/AuthContext";
import ChatsMessages from "./ChatMessages";
import { useUser } from "../../../context/UserContext";

type ChatPreview = {
  chatId: number;
  latestMessage: {
    content: string;
    createdAt: string;
    messageId: number;
    isRead: boolean;
    senderId: number;
  } | null;
  createdAt: string;
  updatedAt: string;
  otherUserName: string;
  otherUserId: number;
  role: "company" | "candidate";
};

type websocketMessage = {
  id: number;
  chatId: number;
  sender: number;
  content: string;
  createdAt: string;
  isRead: boolean;
};

type ChatInfo = {
  chatId: number;
  otherUserName: string;
  otherUserId: number;
  role: "company" | "candidate";
};

export default function ChatsPreview() {
  const [chatsPreview, setChatsPreview] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayChat, setDisplayChat] = useState<boolean>(false);
  const [selectedChatInfo, setSelectedChatInfo] = useState<ChatInfo | null>(
    null,
  );
  const auth = useAuth();
  const user = useUser();

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
            latestMessage: item.latestMessage
              ? {
                  content: item.latestMessage.content,
                  createdAt: item.latestMessage.createdAt,
                  messageId: item.latestMessage.id,
                  isRead: item.latestMessage.isRead,
                  senderId: item.latestMessage.sender,
                }
              : null,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            otherUserName: item.companyName,
            otherUserId: item.companyId,
            role: "company",
          };
        }

        if (auth.role === "company") {
          return {
            chatId: item.chatId,
            latestMessage: item.latestMessage
              ? {
                  content: item.latestMessage.content,
                  createdAt: item.latestMessage.createdAt,
                  messageId: item.latestMessage.id,
                  isRead: item.latestMessage.isRead,
                  senderId: item.latestMessage.sender,
                }
              : null,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            otherUserName: item.candidateName,
            otherUserId: item.candidateId,

            role: "candidate",
          };
        }

        return item;
      });

      setChatsPreview(mapped);
    } catch (err) {
      console.error("Failed to load chats", err);
      setError(err instanceof Error ? err.message : "Failed to load chats");
    } finally {
      setLoading(false);
    }
  };
  const handleChatClick = (chatId: number) => {
    const chat = chatsPreview.find((c) => c.chatId === chatId);
    if (chat) {
      setSelectedChatInfo({
        chatId: chat.chatId,
        otherUserName: chat.otherUserName,
        otherUserId: chat.otherUserId,
        role: chat.role,
      });
      setDisplayChat(true);
    }
  };

  useEffect(() => {
    loadChatPreviews();
  }, [auth]);

  useEffect(() => {
    const { connection } = user;
    if (!connection) return;

    const handleReceiveMessage = (payload: websocketMessage) => {
      setChatsPreview((prev) =>
        prev.map((ch) => {
          if (ch.chatId === payload.chatId) {
            return {
              ...ch,
              updatedAt: payload.createdAt,
              latestMessage: {
                content: payload.content,
                createdAt: payload.createdAt,
                messageId: payload.id,
                isRead: payload.isRead,
                senderId: payload.sender,
              },
            };
          }

          return ch;
        }),
      );

      user.setUnreadCount((prev) => prev + 1);
    };

    connection.on("ReceiveMessage", handleReceiveMessage);

    return () => {
      connection.off("ReceiveMessage", handleReceiveMessage);
    };
  }, [user]);

  return (
    <div className="w-full h-screen flex flex-col bg-background overflow-hidden relative z-10">
      {/* DYNAMIC HEADER */}
      {!displayChat ? (
        /* Standard Blue Header (When looking at previews) */
        <div className="px-10 py-4 bg-primary shrink-0 border-primary/10 rounded-t-2xl">
          <p className="text-l text-primary-foreground font-normal">
            Select a conversation to continue.
          </p>
        </div>
      ) : (
        /* Gray Header (When a chat is actively opened) */
        <div className="rounded-t-2xl px-10 py-4 bg-muted border-b border-border/40 flex items-center justify-between shrink-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {selectedChatInfo?.otherUserName}
            </h2>
            {/* Status indicator */}
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">
                Connected
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setDisplayChat(false);
              setSelectedChatInfo(null);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-muted-foreground hover:text-foreground bg-border/40 hover:bg-border/80 transition-all cursor-pointer"
          >
            ← Back to Previews
          </button>
        </div>
      )}

      {/* BODY CONTENT */}
      {!displayChat ? (
        <section className="flex-1 divide-y divide-border/30 overflow-y-auto">
          {loading && (
            <p className="py-20 text-xs text-muted-foreground/50 text-center animate-pulse tracking-[0.2em] uppercase">
              Loading chats...
            </p>
          )}
          {error && (
            <p className="py-20 text-sm text-destructive bg-destructive/10 text-center font-medium border border-destructive/15 rounded-xl mx-10 mt-8">
              {error}
            </p>
          )}
          {!loading && !error && chatsPreview.length === 0 && (
            <p className="py-24 text-sm text-muted-foreground/45 text-center tracking-wide">
              No active chats found.
            </p>
          )}
          {!loading && !error && chatsPreview.length > 0 && (
            <ul className="divide-y divide-border/30 border border-primary">
              {chatsPreview.map((chat: ChatPreview) => (
                <li
                  key={chat.chatId}
                  onClick={() => handleChatClick(chat.chatId)}
                  className="px-10 py-6 hover:bg-muted/25 transition-all duration-150 cursor-pointer block group text-left"
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {chat.otherUserName}{" "}
                    </span>
                    <span className="text-xs text-accent font-semibold whitespace-nowrap tracking-wide">
                      {new Date(chat.updatedAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground/60 truncate line-clamp-1 pr-4">
                    {chat.latestMessage
                      ? chat.latestMessage.content
                      : "No messages yet."}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        /* FIXED: Added min-h-0 and h-full here to stop container collapse / bleed overflow */
        <div className="flex flex-col flex-1 min-h-0 h-full overflow-hidden">
          <div className="flex-1 min-h-0 h-full overflow-hidden">
            <ChatsMessages chatInfo={selectedChatInfo!} />
          </div>
        </div>
      )}
    </div>
  );
}
