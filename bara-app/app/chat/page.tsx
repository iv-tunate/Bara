"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import ChatSidebar from "@/components/ChatSideBar";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import MessageInput from "@/components/ChatMessageInput";
import { api } from "@/utils/api";
import { getUserSession } from "@/utils/tokenManager";
import { useSignalR } from "@/context/SignalRContext";
import toast from "react-hot-toast";

interface ChatSession {
  id: string; // ChatId
  name: string; // OtherUserName
  avatar: string;
  lastMessage: string;
  unreadCount: number;
  scriptTitle: string;
  otherUserId: string;
  isClosed: boolean;
}

interface UIMessage {
  id: string | number;
  text: string;
  time: string;
  sender: "me" | "other";
}

import { Suspense } from "react";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialChatId = searchParams?.get("id");
  console.log("ChatPage: Initial Chat ID:", initialChatId);

  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);

  const { connection } = useSignalR();

  useEffect(() => {
    const session = getUserSession();
    if (!session?.userId) {
      router.push("/auth/login");
      return;
    }
    setCurrentUserId(session.userId);

    const loadChats = async () => {
      try {
        const response = await api.getChats(session.userId);
        if (response.success && response.data) {
          const mappedChats: ChatSession[] = response.data.map((c: any) => ({
            id: c.chatId,
            name: c.otherUserName || "Unknown User",
            avatar: "/default-avatar.png",
            lastMessage: c.lastMessageContent,
            unreadCount: c.unreadCount || 0,
            scriptTitle: c.scriptTitle,
            otherUserId: c.otherUserId,
            isClosed: c.isClosed,
          }));

          setChats(mappedChats);

          if (initialChatId) {
            setSelectedChatId(initialChatId);
          } else if (mappedChats.length > 0) {
            setSelectedChatId(mappedChats[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load chats", err);
        toast.error("Failed to load chats");
      } finally {
        setLoadingChats(false);
      }
    };

    loadChats();
  }, [router, initialChatId]);

  useEffect(() => {
    if (!selectedChatId || !currentUserId) return;

    const fetchMessages = async () => {
      try {
        const response = await api.getChatHistory(selectedChatId);
        if (response.success && response.data) {
          const mappedMessages: UIMessage[] = response.data.map((m: any) => ({
            id: m.messageId || m.id || Math.random(),
            text: m.content,
            time: new Date(m.sentAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            sender: m.senderId === currentUserId ? "me" : "other",
          }));

          setChats((prev) => {
            if (!prev.find((c) => c.id === selectedChatId)) {
              return [
                ...prev,
                {
                  id: selectedChatId,
                  name: "Chat",
                  avatar: "/default-avatar.png",
                  lastMessage: mappedMessages[0]?.text || "",
                  unreadCount: 0,
                  scriptTitle: "",
                  otherUserId: "",
                  isClosed: false,
                },
              ];
            }
            return prev;
          });

          setMessages(mappedMessages.reverse());

          await api.markMessagesRead(selectedChatId);

          setChats((prev) =>
            prev.map((c) =>
              c.id === selectedChatId ? { ...c, unreadCount: 0 } : c
            )
          );
        }
      } catch (err) {
        console.error("Failed to load messages", err);
        toast.error("Failed to load chat history");
      }
    };

    fetchMessages();
  }, [selectedChatId, currentUserId]);

  useEffect(() => {
    if (!connection) return;

    const handleMessageReceived = (data: {
      ChatId: string;
      Message: any;
      ScriptTitle: string;
    }) => {
      setChats((prev) => {
        const existingChat = prev.find((c) => c.id === data.ChatId);
        if (!existingChat) {
          return prev;
        }

        const updatedChats = prev.map((c) => {
          if (c.id === data.ChatId) {
            return {
              ...c,
              lastMessage:
                data.Message.Content?.substring(0, 30) || "Attachment",
              unreadCount: c.id === selectedChatId ? 0 : c.unreadCount + 10,
            };
          }
          return c;
        });

        return updatedChats.sort((a, b) => (a.id === data.ChatId ? -1 : 1));
      });

      if (data.ChatId === selectedChatId) {
        const newMessage: UIMessage = {
          id: Date.now(),
          text: data.Message.Content,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sender: "other",
        };
        setMessages((prev) => [...prev, newMessage]);
        api.markMessagesRead(data.ChatId);
      }
    };

    connection.on("MessageReceived", handleMessageReceived);

    return () => {
      connection.off("MessageReceived", handleMessageReceived);
    };
  }, [connection, selectedChatId]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !selectedChatId) return;

    const tempId = Date.now();
    const optimisticAuth: UIMessage = {
      id: tempId,
      text: text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sender: "me",
    };
    setMessages((prev) => [...prev, optimisticAuth]);

    try {
      const response = await api.sendMessage(selectedChatId, text);
      if (!response.success) {
        toast.error("Failed to send message");
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } else {
        setChats((prev) =>
          prev.map((c) =>
            c.id === selectedChatId ? { ...c, lastMessage: text } : c
          )
        );
      }
    } catch (err) {
      toast.error("Error sending message");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  const selectedChat = chats.find((c) => c.id === selectedChatId);

  return (
    <div className="flex flex-1 flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">
      {/* SIDEBAR */}
      <ChatSidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={(id) => setSelectedChatId(id)}
      />

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            <ChatHeader chat={selectedChat} />

 
            <ChatMessages messages={messages as any[]} />
            <MessageInput onSend={handleSendMessage} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {loadingChats
              ? "Loading chats..."
              : "Select a chat to start messaging"}
          </div>
        )}
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DashboardNavbar />
      <Suspense fallback={<div className="p-10">Loading chat...</div>}>
        <ChatContent />
      </Suspense>
    </div>
  );
}
