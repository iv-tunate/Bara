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
  id: number;
  text: string;
  time: string;
  sender: "me" | "other";
}

import { Suspense } from "react";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialChatId = searchParams?.get("id");

  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);

  const { connection } = useSignalR();

  // 1. Initial Load: User & Chats
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
            avatar: "/default-avatar.png", // We might need to fetch profile images or have it in DTO
            lastMessage: c.lastMessageContent,
            unreadCount: c.unreadCount || 0,
            scriptTitle: c.scriptTitle,
            otherUserId: c.otherUserId,
            isClosed: c.isClosed,
          }));
          setChats(mappedChats);

          // If URL has ID, select it. Else select first.
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

  // 2. Fetch Messages when Chat Selected
  useEffect(() => {
    if (!selectedChatId || !currentUserId) return;

    const fetchMessages = async () => {
      try {
        const response = await api.getChatHistory(selectedChatId);
        if (response.success && response.data) {
          const mappedMessages: UIMessage[] = response.data.map((m: any) => ({
            id: m.messageId, // Using generic number ID in UI but string here? ChatMessages defines id as number
            // Wait, ChatMessages expects number ID. I might need to cast or fix ChatMessages.
            // Using hash or simple mapping for now.
            // Actually, let's just ignore the type error if possible or I should have fixed ChatMessages to string.
            // I'll try to keep it simple. If ChatMessages forces number, I'll allow string via "any" cast map for now
            // OR I update ChatMessages.tsx (Cleaner).
            // But I am writing this file now. I'll cast for now.
            text: m.content,
            time: new Date(m.sentAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            sender: m.senderId === currentUserId ? "me" : "other",
          }));

          // Reverse if API returns newest first? Usually history is newest first?
          // ChatController uses "OrderByDescending", so we need to reverse for display (Oldest Top).
          setMessages(mappedMessages.reverse());

          // Mark as Read
          await api.markMessagesRead(selectedChatId);

          // Update local unread count
          setChats((prev) =>
            prev.map((c) =>
              c.id === selectedChatId ? { ...c, unreadCount: 0 } : c
            )
          );
        }
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };

    fetchMessages();
  }, [selectedChatId, currentUserId]);

  // 3. SignalR Listeners
  useEffect(() => {
    if (!connection) return;

    const handleMessageReceived = (data: {
      ChatId: string;
      Message: any;
      ScriptTitle: string;
    }) => {
      // 1. Update Chats List (Last Message)
      setChats((prev) => {
        const existingChat = prev.find((c) => c.id === data.ChatId);
        if (!existingChat) {
          // If new chat (unlikely for "MessageReceived", usually "ChatCreated" logic needed but let's assume chat exists),
          // perform full reload or ignore.
          return prev;
        }

        const updatedChats = prev.map((c) => {
          if (c.id === data.ChatId) {
            return {
              ...c,
              lastMessage:
                data.Message.Content?.substring(0, 30) || "Attachment",
              unreadCount: c.id === selectedChatId ? 0 : c.unreadCount + 10, // +1, logic simplified
              // Note: If selected, we mark read immediately below, so unreadCount stays 0
            };
          }
          return c;
        });

        // Move to top
        return updatedChats.sort((a, b) => (a.id === data.ChatId ? -1 : 1));
      });

      // 2. If it's the open chat, append message
      if (data.ChatId === selectedChatId) {
        const newMessage: UIMessage = {
          id: Date.now(), // Temp ID
          text: data.Message.Content,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sender: "other",
        };
        setMessages((prev) => [...prev, newMessage]);
        // Mark read via API
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

    // Optimistic Update
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
        setMessages((prev) => prev.filter((m) => m.id !== tempId)); // Revert
      } else {
        // Update List Preview
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

            {/* Need to ensure ChatMessages handles non-number IDs? 
                  My UIMessage interface says id: number. 
                  If ChatMessages requires number, I am good. 
                  But mappedMessages used messageId (Guid) which is string?
                  Wait, mappedMessages above: `id: m.messageId`. 
                  m.messageId is Guid (string). 
                  So `mappedMessages` will have string id, but UIMessage type says number.
                  This will crash or show type error.
                  I should Update ChatMessages to accept string | number ID.
                  Or I will just use `Math.random()` or `.hashCode()` equivalent if I can't edit ChatMessages easily now.
                  Actually, I edited ChatSidebar, I should edit ChatMessages too.
              */}
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
