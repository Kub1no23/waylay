import { API } from "../../../api/auth";
import { useAuth } from "../../../context/AuthContext";
import { useEffect, useState } from "react";
import { useUser } from "../../../context/UserContext";

type ChatInfo = {
  chatId: number;
  otherUserName: string;
  otherUserId: number;
  role: "company" | "candidate";
};

interface ChatHistory {
  chatId: number;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

interface Message {
  id: number | string;
  senderId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
}

type websocketMessage = {
  id: number;
  chatId: number;
  sender: number;
  content: string;
  createdAt: string;
  isRead: boolean;
};

export default function ChatsMessages({ chatInfo }: { chatInfo: ChatInfo }) {
  const [selectedChatInfo] = useState<ChatInfo>(chatInfo);
  const [chatHistory, setChatHistory] = useState<ChatHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const user = useUser();

  const [message, setMessage] = useState("");

  const loadChatMessages = async (chatId: number): Promise<void> => {
    setError(null);
    setLoading(true);

    try {
      const response = await API.get<any>(`/chat/${chatId}`);
      const data = response.data;
      console.log(data);

      setChatHistory(
        data.messages.length
          ? ({
              chatId: data.chatId,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              messages: data.messages.map((m: any) => ({
                id: m.id,
                senderId: m.sender,
                content: m.content,
                createdAt: m.createdAt,
                isRead: m.isRead,
              })),
            } as ChatHistory)
          : null,
      );

      const sendRead = async () => {
        try {
          await API.post(`/chat/${data.chatId}/read`);
          await user.connection?.invoke("SendReadReceipt", String(data.chatId));
        } catch (err) {
          console.error("Failed to send read receipt via hub or API", err);
        }
      };
      sendRead();
    } catch (err) {
      console.error("Failed to load chat history", err);
      setError(
        err instanceof Error ? err.message : "Failed to load chat history",
      );
      setChatHistory(null);
    } finally {
      setLoading(false);
    }
  };
  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const response = await API.post(
        `/chat/user/${selectedChatInfo.otherUserId}`,
        { content: message },
      );
      const newMessage = response.data;

      console.log(newMessage);
    } catch (err) {
      console.error("Failed to send message", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
    }

    setMessage("");
  };

  useEffect(() => {
    loadChatMessages(selectedChatInfo.chatId);
  }, [selectedChatInfo]);
  useEffect(() => {
    const { connection } = user;
    if (!connection) return;

    const handleReceiveMessage = (payload: websocketMessage) => {
      if (payload.chatId !== selectedChatInfo.chatId) return;
      user.setUnreadCount((prev) => prev - 1);

      setChatHistory((prev) => {
        if (!prev)
          return {
            chatId: payload.chatId,
            createdAt: payload.createdAt,
            updatedAt: payload.createdAt,
            messages: [
              {
                id: payload.id,
                senderId: payload.sender,
                content: payload.content,
                createdAt: payload.createdAt,
                isRead: payload.isRead,
              },
            ],
          };

        return {
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: payload.id,
              senderId: payload.sender,
              content: payload.content,
              createdAt: payload.createdAt,
              isRead: payload.isRead,
            },
          ],
        };
      });

      const sendRead = async () => {
        try {
          await API.post(`/chat/${payload.chatId}/read`);
          await connection.invoke("SendReadReceipt", String(payload.chatId));
        } catch (err) {
          console.error("Failed to send read receipt via hub or API", err);
        }
      };

      sendRead();
    };
    const handleReadReceipt = (chatId: number, currentUserId: number) => {
      console.log("Received read receipt via websocket", {
        chatId,
        currentUserId,
      });
      setChatHistory((prev) => {
        if (!prev || prev.chatId !== chatId) return prev;
        return {
          ...prev,
          messages: prev.messages.map((m) => ({
            ...m,
            isRead: m.senderId !== currentUserId ? true : m.isRead,
          })),
        } as ChatHistory;
      });
    };

    connection.on("ReceiveMessage", handleReceiveMessage);

    connection.on(
      "ReceiveReadReceipt",
      (chatId: number, currentUserId: number) => {
        handleReadReceipt(chatId, currentUserId);
      },
    );

    return () => {
      connection.off("ReceiveMessage", handleReceiveMessage);
      connection.off("ReceiveReadReceipt", handleReadReceipt);
    };
  }, [user]);

  return (
    /* FIXED: Added 'min-h-0' here to freeze the flex box boundary from expanding out of view bounds */
    <div className="w-full h-full flex flex-col min-h-0 relative z-10 overflow-hidden">
      {/* Main Message Stream Container */}
      <div className="flex-1 overflow-y-auto p-10 space-y-6 bg-orange-50 max-h-[70vh]">
        {loading && (
          <p className="py-12 text-xs text-muted-foreground/50 text-center animate-pulse tracking-[0.2em] uppercase">
            Loading messages...
          </p>
        )}
        {error && (
          <p className="py-6 text-sm text-destructive bg-destructive/10 text-center font-medium border border-destructive/15 rounded-xl">
            {error}
          </p>
        )}
        {!loading &&
          !error &&
          (!chatHistory || chatHistory.messages.length === 0) && (
            <p className="py-12 text-sm text-muted-foreground/45 text-center tracking-wide">
              No messages yet. Start the conversation below.
            </p>
          )}

        {!loading &&
          !error &&
          chatHistory &&
          chatHistory.messages.length > 0 && (
            <div className="space-y-4">
              {chatHistory.messages.map((m) => {
                const isMe = Number(m.senderId) === Number(auth.userId);
                console.log({
                  senderId: m.senderId,
                  userId: auth.userId,
                  isMe,
                });
                return (
                  <div
                    key={String(m.id)}
                    className={`flex flex-col max-w-[75%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                  >
                    <div
                      className={`rounded-2xl px-5 py-3 text-sm leading-relaxed tracking-wide shadow-sm transition-all ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-tr-none font-medium"
                          : "bg-muted/60 border border-border/20 text-foreground rounded-tl-none"
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground/45 mt-1.5 font-medium tracking-normal px-1">
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
      </div>

      {/* Footer Message Input Tray - Always Rendered */}
      <div className="px-10 py-6 border-t border-border/30 bg-muted flex gap-4 items-center shrink-0 rounded-b-2xl">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && message.trim()) handleSend();
          }}
          className="flex-1 min-w-0 rounded-xl border border-border bg-background px-4 py-3.5 text-sm placeholder:text-muted-foreground/45 text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="inline-flex items-center justify-center rounded-xl bg-accent cursor-pointer px-6 py-3.5 text-sm font-semibold text-primary-foreground tracking-wide transition-all hover:bg-accent/80 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30 whitespace-nowrap"
        >
          Send
        </button>
      </div>
    </div>
  );
}
