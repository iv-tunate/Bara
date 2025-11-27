"use client";

interface Message {
  id: number;
  text: string;
  time: string;
  sender: "me" | "other";
}

export default function ChatMessages({ messages }: { messages: Message[] }) {
  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div className="flex justify-center">
        <span className="text-xs bg-[#22242A] text-white px-3 py-1 rounded">
          June 5th, 2024
        </span>
      </div>

      {messages.map((msg) => {
        const isOther = msg.sender === "other";

        return (
          <div
            key={msg.id}
            className={`flex ${isOther ? "justify-start" : "justify-end"}`}
          >
            <div
              className={` p-3 text-[14px] leading-tight
                ${
                  isOther
                    ? "bg-[#FFFFFF] border border-[#DADBDD] text-[#333740] rounded-md"
                    : "bg-[#F5F5F5] text-[#333740] rounded-md border border-[#DADBDD]"
                }`}
            >
              <p>{msg.text}</p>

              <p
                className={`text-right text-[11px] mt-1 
                  ${isOther ? "text-[#6F7073]" : "text-white/80"}
                `}
              >
                {msg.time}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
