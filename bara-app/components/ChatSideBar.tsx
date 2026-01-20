"use client";

import Image from "next/image";
import BackButton from "./BackButton";

export default function ChatSidebar({
  chats,
  selectedChatId,
  onSelectChat,
}: {
  chats: any[];
  selectedChatId: string;
  onSelectChat: (id: string) => void;
}) {
  return (
    <aside className="w-full md:w-[260px] border-r border-gray-200 p-4 overflow-y-auto">
      <BackButton label="" className="p-0!" />
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-[15px] font-semibold">Chats</h2>
      </div>

      <div className="flex flex-col gap-2">
        {/* Admin Support Static Item */}
        <div
          onClick={() => onSelectChat("ADMIN_SUPPORT")}
          className={`flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer ${
            selectedChatId === "ADMIN_SUPPORT"
              ? "bg-red-50 border border-red-100"
              : "hover:bg-gray-50 border border-transparent"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#810306] flex items-center justify-center text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>

            <div>
              <p className="font-bold text-[#810306]">Admin Support</p>
              <p className="text-xs text-gray-500">Contact us for help</p>
            </div>
          </div>
        </div>

        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer ${
              selectedChatId === chat.id ? "bg-gray-100" : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Image
                src={chat.avatar}
                width={40}
                height={40}
                alt={chat.name}
                className="rounded-full"
              />

              <div>
                <p className="font-medium">{chat.name}</p>
                <p className="text-xs text-gray-500">{chat.lastMessage}</p>
              </div>
            </div>

            {chat.unreadCount ? (
              <span className="min-w-[18px] h-5 px-1 flex items-center justify-center text-xs font-medium text-[#0DA500] border-[#0DA500] bg-[#C3E8BF] rounded-full">
                {chat.unreadCount}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </aside>
  );
}
