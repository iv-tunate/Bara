"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ChatHeader({ chat }: { chat: any }) {
  const router = useRouter();

  const openScript = () => {
    router.push("/script");
  };

  return (
    <div className="border-b border-[#ABADB2] p-4 flex items-center gap-3 shadow-sm">
      <Image
        src={chat.avatar}
        width={40}
        height={40}
        alt={chat.name}
        className="rounded-full"
      />

      <div>
        <p className="font-semibold">{chat.name}</p>
        <p className="text-xs text-[#858990]">Active 5 minutes ago</p>
      </div>

      <button
        onClick={openScript}
        className="ml-auto text-white bg-[#810306] hover:bg-red-600 px-4 py-2 rounded cursor-pointer"
      >
        Open script
      </button>
    </div>
  );
}
