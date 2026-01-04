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
      <div className="flex items-center gap-2 mb-4">
        <BackButton label="" className="!p-0" />
        <h2 className="text-[15px] font-semibold">Chats</h2>
      </div>

      <div className="flex flex-col gap-2">
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
