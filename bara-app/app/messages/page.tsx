"use client";

import DashboardNavbar from "@/components/DashboardNavbar";
import ChatSidebar from "@/components/ChatSideBar";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import MessageInput from "@/components/ChatMessageInput";

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <DashboardNavbar />

      {/* Chat Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        <ChatSidebar />

        <main className="flex-1 flex flex-col">
          <ChatHeader />
          <ChatMessages />
          <MessageInput />
        </main>
      </div>
    </div>
  );
}
