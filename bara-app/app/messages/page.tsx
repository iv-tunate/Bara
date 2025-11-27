"use client";

import { useState } from "react";

import DashboardNavbar from "@/components/DashboardNavbar";
import ChatSidebar from "@/components/ChatSideBar";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import MessageInput from "@/components/ChatMessageInput";

export default function MessagesPage() {
  // --- ALL CHATS ---
  const [chats, setChats] = useState([
    {
      id: 1,
      name: "Morayo Abu",
      avatar: "/morayo-abu.png",
      lastMessage: "Maybe tomorrow...",
      unreadCount: 1,
      messages: [
        { id: 1, text: "Hello Morayo", time: "07:20", sender: "me" },
        { id: 2, text: "Maybe tomorrow...", time: "07:21", sender: "other" },
      ],
    },
    {
      id: 2,
      name: "Joan Stewart",
      avatar: "/joan.png",
      lastMessage: "Let's talk later",
      unreadCount: 0,
      messages: [{ id: 1, text: "Hi Joan", time: "07:20", sender: "me" }],
    },
    {
      id: 3,
      name: "Jane Doe",
      avatar: "/jane-doe.png",
      lastMessage: "TTYL",
      unreadCount: 0,
      messages: [
        { id: 1, text: "Hey Jane!", time: "07:20", sender: "me" },
        { id: 2, text: "TTYL", time: "07:21", sender: "other" },
      ],
    },
  ]);

  // --- SELECTED CHAT ---
  const [selectedChatId, setSelectedChatId] = useState(3);

  // Current chat
  const selectedChat = chats.find((c) => c.id === selectedChatId)!;

  // --- SEND MESSAGE TO SELECTED CHAT ---
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  id: chat.messages.length + 1,
                  text,
                  time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  sender: "me",
                },
              ],
            }
          : chat
      )
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DashboardNavbar />

      {/* RESPONSIVE: MOBILE USES COLUMN, DESKTOP USES ROW */}
      <div className="flex flex-1 flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">
        {/* SIDEBAR */}
        <ChatSidebar
          chats={chats}
          selectedChatId={selectedChatId}
          onSelectChat={(id) => setSelectedChatId(id)}
        />

        {/* MAIN CHAT AREA */}
        <main className="flex-1 flex flex-col">
          <ChatHeader chat={selectedChat} />
          <ChatMessages messages={selectedChat.messages} />
          <MessageInput onSend={handleSendMessage} />
        </main>
      </div>
    </div>
  );
}
