"use client";

import Image from "next/image";

interface ChatPreview {
  id: number;
  name: string;
  message: string;
  avatar: string;
  active?: boolean;
  unreadCount?: number; // only count if user has unread messages
}

const chats: ChatPreview[] = [
  {
    id: 1,
    name: "Morayo Abu",
    message: "Maybe tomorrow...",
    avatar: "/morayo-abu.png",
    unreadCount: 1, // only this one will show badge
  },
  {
    id: 2,
    name: "Joan Stewart",
    message: "Let's talk later",
    avatar: "/joan.png",
  },
  {
    id: 3,
    name: "Jane Doe",
    message: "TTYL",
    avatar: "/jane-doe.png",
    active: true,
  },
];

export default function ChatSidebar() {
  return (
    <aside className="w-[260px] border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-[15px] font-semibold mb-4">Chats</h2>

      <div className="flex flex-col gap-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer ${
              chat.active ? "bg-gray-100" : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={chat.avatar}
                  width={40}
                  height={40}
                  alt={chat.name}
                  className="rounded-full"
                />
                {chat.active && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>

              <div>
                <p className="font-medium">{chat.name}</p>
                <p className="text-xs text-gray-500">{chat.message}</p>
              </div>
            </div>

            {chat.unreadCount && chat.unreadCount >= 1 && (
              <span className="min-w-[18px] h-5 px-1 flex items-center justify-center text-xs font-medium text-[#0DA500] border-[#0DA500] bg-[#C3E8BF] rounded-full">
                {chat.unreadCount}
              </span>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
