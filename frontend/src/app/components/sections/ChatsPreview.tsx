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
    <div className="chats-preview">
      <h2>Chats Preview</h2>
      <p>This is where the chats preview will be displayed.</p>
      {!displayChat ? (
        <section>
          {loading && <p>Loading chats...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && chatsPreview.length === 0 && (
            <p>No chats found.</p>
          )}
          {!loading && !error && chatsPreview.length > 0 && (
            <ul>
              {chatsPreview.map((chat: ChatPreview) => (
                <li
                  key={chat.chatId}
                  onClick={() => handleChatClick(chat.chatId)}
                >
                  <p>
                    {chat.otherUserName} : {chat.role}
                  </p>
                  {chat.latestMessage ? (
                    <p>{chat.latestMessage.content}</p>
                  ) : (
                    <p>No messages yet.</p>
                  )}
                  <p>{new Date(chat.updatedAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          <div
            onClick={() => {
              setDisplayChat(false);
              setSelectedChatInfo(null);
            }}
          >
            Back to Previews
          </div>
          <ChatsMessages chatInfo={selectedChatInfo!} />
        </>
      )}
    </div>
  );
}
