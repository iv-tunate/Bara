"use client";

import { useState } from "react";
import Image from "next/image";

export default function MessageInput({
  onSend,
}: {
  onSend: (msg: string) => void;
}) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  };

  return (
    <div className="border-t border-[#ABADB2] p-4 shadow-md">
      <div className="relative">
        <input
          className="w-full border border-[#ABADB2] rounded-full py-2 px-4 pr-10 focus:outline-none placeholder-[#858990] shadow-md"
          placeholder="Message"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); 
              handleSend();
            }
          }}
        />

        {/* SEND ICON BUTTON */}
        <button
          onClick={handleSend}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
        >
          <Image src="/send-icon.png" width={20} height={20} alt="Send" />
        </button>
      </div>
    </div>
  );
}
