"use client";

import Image from "next/image";

export default function ChatHeader() {
  return (
    <div className="border-b border-[#ABADB2] p-4 flex items-center gap-3">
      <Image
        src="/jane-doe.png"
        width={40}
        height={40}
        alt="Jane Doe"
        className="rounded-full"
      />

      <div>
        <p className="font-semibold">Jane Doe</p>
        <p className="text-xs text-[#858990]">Active 5 minutes ago</p>
      </div>

      <button className="ml-auto text-white bg-[#810306] hover:bg-red-600 px-4 py-2 rounded">
        Open script
      </button>
    </div>
  );
}
