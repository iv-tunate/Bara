"use client";

import { useEffect, useState, useRef } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import { api } from "@/utils/api";
import { useSignalR } from "@/context/SignalRContext";
import toast from "react-hot-toast";
import { Search, Shield, Ban, CheckCircle, Send } from "lucide-react";

interface SupportUser {
  userId: string;
  userName: string;
  userEmail: string;
  userProfileImage: string;
  isBlocked: boolean;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  isAdminSender: boolean;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export default function AdminSupportPage() {
  const [users, setUsers] = useState<SupportUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { connection } = useSignalR();

  useEffect(() => {
    loadUsers();
  }, [search]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!connection) return;
    const handleMessage = (data: any) => {
      loadUsers();
      if (data.senderId === selectedUserId || data.userId === selectedUserId) {
        if (data.content) {
          setMessages((prev) => [...prev, data]);
        }
      }
    };
    connection.on("ReceiveSupportMessage", handleMessage);
    return () => {
      connection.off("ReceiveSupportMessage", handleMessage);
    };
  }, [connection, selectedUserId]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.adminGetSupportUsers(1, 50, search);
      if (res.success && res.data) {
        setUsers(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadChat = async (userId: string) => {
    setSelectedUserId(userId);
    try {
      const res = await api.adminGetSupportHistory(userId);
      if (res.success && res.data) {
        setMessages(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!selectedUserId || !inputText.trim()) return;
    const content = inputText;
    setInputText("");

    const tempMsg = {
      id: Date.now().toString(),
      senderId: "admin",
      isAdminSender: true,
      content: content,
      sentAt: new Date().toISOString(),
      isRead: true,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await api.adminSendSupportMessage(selectedUserId, content);
    } catch (e) {
      toast.error("Failed to send");
    }
  };

  const toggleBlock = async (activeUser: SupportUser) => {
    if (
      !confirm(
        `Are you sure you want to ${activeUser.isBlocked ? "unblock" : "block"} this user?`,
      )
    )
      return;
    try {
      await api.adminToggleSupportBlock(activeUser.userId);
      toast.success(activeUser.isBlocked ? "User Unblocked" : "User Blocked");
      loadUsers();
    } catch (e) {
      toast.error("Action failed");
    }
  };

  const activeUser = users.find((u) => u.userId === selectedUserId);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-lg mb-4">Support Queue</h2>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#810306]"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.userId}
                onClick={() => loadChat(user.userId)}
                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 flex gap-3 ${selectedUserId === user.userId ? "bg-red-50" : ""}`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                  {user.userProfileImage && (
                    <img
                      src={user.userProfileImage}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm truncate">
                      {user.userName}
                    </h4>
                    {user.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                        {user.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {user.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {activeUser ? (
          <div className="flex-1 flex flex-col bg-white">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  {activeUser.userProfileImage && (
                    <img
                      src={activeUser.userProfileImage}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-bold">{activeUser.userName}</h3>
                  <p className="text-xs text-gray-500">
                    {activeUser.userEmail}
                  </p>
                </div>
                {activeUser.isBlocked && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold">
                    BLOCKED
                  </span>
                )}
              </div>
              <button
                onClick={() => toggleBlock(activeUser)}
                className={`text-xs px-3 py-2 rounded font-bold flex items-center gap-2 ${activeUser.isBlocked ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
              >
                {activeUser.isBlocked ? (
                  <>
                    <CheckCircle size={14} /> Unblock
                  </>
                ) : (
                  <>
                    <Ban size={14} /> Block User
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isAdminSender ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-lg ${msg.isAdminSender ? "bg-[#810306] text-white" : "bg-gray-100 text-gray-800"}`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    <p className="text-[10px] opacity-70 text-right mt-1">
                      {new Date(msg.sentAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-[#810306]"
                  placeholder="Reply..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="bg-[#810306] text-white p-2 rounded-full hover:bg-red-900"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a user to chat
          </div>
        )}
      </div>
    </div>
  );
}
