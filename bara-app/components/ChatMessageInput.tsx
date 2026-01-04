"use client";

import { useState } from "react";
import Image from "next/image";

export default function MessageInput({
  onSend,
  disabled,
}: {
  onSend: (msg: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  };

  return (
    <div className="border-t border-[#ABADB2] p-4 shadow-md bg-white">
      <div className="relative">
        <input
          className={`w-full border border-[#ABADB2] rounded-full py-2 px-4 pr-10 focus:outline-none placeholder-[#858990] shadow-md ${
            disabled ? "bg-gray-100 cursor-not-allowed text-gray-400" : ""
          }`}
          placeholder={disabled ? "This chat is closed." : "Message"}
          value={value}
          disabled={disabled}
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
          disabled={disabled}
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${
            disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <Image src="/send-icon.png" width={20} height={20} alt="Send" />
        </button>
      </div>
    </div>
  );
}
