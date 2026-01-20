"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/utils/api";
import { useSignalR } from "@/context/SignalRContext";
import { Send, Shield, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";

interface Message {
  id: string;
  senderId: string;
  isAdminSender: boolean;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export default function SupportChatWindow({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { connection } = useSignalR();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadHistory();
    api.markSupportRead();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!connection) return;

    const handleSupportMessage = (data: Message) => {
      setMessages((prev) => [...prev, data]);
      api.markSupportRead();
    };

    connection.on("ReceiveSupportMessage", handleSupportMessage);

    return () => {
      connection.off("ReceiveSupportMessage", handleSupportMessage);
    };
  }, [connection]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await api.getSupportHistory();
      if (response.success && response.data) {
        setMessages(response.data.data);
      } else if (response.statusCode === 403) {
        setIsBlocked(true);
      }
    } catch (error) {
      console.error("Failed to load support history", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    if (isBlocked) {
      toast.error("You are blocked from support chat.");
      return;
    }

    const tempId = Date.now().toString();
    const optimisticMsg: Message = {
      id: tempId,
      senderId: currentUserId,
      isAdminSender: false,
      content: inputText,
      sentAt: new Date().toISOString(),
      isRead: false,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText("");

    try {
      const response = await api.sendSupportMessage(optimisticMsg.content);
      if (!response.success) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        if (response.statusCode === 429) {
          toast.error("Daily message limit exceeded.");
        } else if (response.statusCode === 403) {
          setIsBlocked(true);
          toast.error("You have been blocked from support.");
        } else {
          toast.error("Failed to send message.");
        }
      } 
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast.error("Network error sending message.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#810306] flex items-center justify-center text-white shadow-md">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Bara Support Team</h2>
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-800 leading-relaxed">
          Welcome to Bara Support. Please allow up to 24 hours for a response.
          <br />
          <strong>Note:</strong> Abusive language will result in an immediate
          ban from support services.
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#810306]"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 opacity-50">
            <Shield size={48} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">
              Start a conversation with our support team.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = !msg.isAdminSender;
            return (
              <div
                key={msg.id}
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                    isMe
                      ? "bg-[#810306] text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                  <p
                    className={`text-[10px] mt-1 text-right ${isMe ? "text-white/70" : "text-gray-400"}`}
                  >
                    {new Date(msg.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        {isBlocked ? (
          <div className="bg-red-50 text-red-600 text-center py-3 rounded-lg border border-red-100 font-medium text-sm">
            You have been blocked from using Support Chat. Please contact
            hello@bara.com.
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-[#810306] focus:ring-1 focus:ring-[#810306] transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="w-10 h-10 bg-[#810306] text-white rounded-full flex items-center justify-center hover:bg-red-900 transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-md shadow-red-100"
            >
              <Send size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
