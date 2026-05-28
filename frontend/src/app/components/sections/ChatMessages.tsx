import { API } from "../../../api/auth";
import { useAuth } from "../../../api/AuthContext";
import { useEffect, useState } from "react";
import { useUser } from "../../../context/UserContext";

type ChatInfo = {
    chatId: number;
    otherUserName: string;
    otherUserId: number;
    role: "company" | "candidate";
}

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
    const [selectedChatInfo, setSelectedChatInfo] = useState<ChatInfo>(chatInfo);
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

            setChatHistory(data.messages.length ? {
                chatId: data.chatId,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                messages: data.messages.map((m: any) => ({
                    id: m.id,
                    senderId: m.sender,
                    content: m.content,
                    createdAt: m.createdAt,
                    isRead: m.isRead
                }))
            } as ChatHistory : null);

            const sendRead = async () => {
                try {
                    await API.post(`/chat/${data.chatId}/read`);
                    await user.connection?.invoke("SendReadReceipt", String(data.chatId));
                }
                catch (err) {
                    console.error("Failed to send read receipt via hub or API", err);
                }
            }
            sendRead();
        } catch (err) {
            console.error("Failed to load chat history", err);
            setError(err instanceof Error ? err.message : "Failed to load chat history");
            setChatHistory(null);
        } finally {
            setLoading(false);
        }
    };
    const handleSend = async () => {
        if (!message.trim()) return;

        try {
            const response = await API.post(`/chat/user/${selectedChatInfo.otherUserId}`, { content: message });
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
            user.setUnreadCount(prev => prev - 1);

            setChatHistory(prev => {
                if (!prev) return {
                    chatId: payload.chatId,
                    createdAt: payload.createdAt,
                    updatedAt: payload.createdAt,
                    messages: [{
                        id: payload.id,
                        senderId: payload.sender,
                        content: payload.content,
                        createdAt: payload.createdAt,
                        isRead: payload.isRead
                    }]
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
                            isRead: payload.isRead
                        }
                    ]
                }
            })

            const sendRead = async () => {
                try {
                    await API.post(`/chat/${payload.chatId}/read`);
                    await connection.invoke("SendReadReceipt", String(payload.chatId));
                }
                catch (err) {
                    console.error("Failed to send read receipt via hub or API", err);
                }
            }

            sendRead();
        };
        const handleReadReceipt = (chatId: number, currentUserId: number) => {
            console.log("Received read receipt via websocket", { chatId, currentUserId });
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

        connection.on("ReceiveReadReceipt", (chatId: number, currentUserId: number) => {
            handleReadReceipt(chatId, currentUserId);
        });

        return () => {
            connection.off("ReceiveMessage", handleReceiveMessage);
            connection.off("ReceiveReadReceipt", handleReadReceipt);
        };
    }, [user]);

    return (
        <div className="chat-messages">
            <div>Selected Chat: {selectedChatInfo.otherUserName}</div>
            {loading && <p>Loading messages...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && !error && !chatHistory && <p>No messages.</p>}
            {!loading && !error && chatHistory && (<>
                <ul>
                    {chatHistory.messages.map((m) => (
                        <li key={String(m.id)}>
                            <strong>{m.senderId === auth.userId ? `you` : `${selectedChatInfo.otherUserName}`}</strong>: {m.content} <em>({new Date(m.createdAt).toLocaleString()})</em>
                        </li>
                    ))}
                </ul>
                <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
                <button onClick={handleSend} disabled={!message.trim()}>Send Test Message</button>
            </>
            )}
        </div>
    );
}