 "use client";

export default function ChatMessages() {
  const messages = [
    {
      id: 1,
      text: "Let’s discuss this tomorrow. Let's discuss this tomorrow",
      time: "07:20am",
      sender: "me",
    },
    {
      id: 2,
      text: "Let’s discuss this tomorrow. Let’s discuss this tomorrow.",
      time: "07:20am",
      sender: "me",
    },
    {
      id: 3,
      text: "Let’s discuss this tomorrow. Let’s discuss this tomorrow.",
      time: "07:20am",
      sender: "other",
    },
    {
      id: 4,
      text: "Let’s discuss this tomorrow. Let’s discuss this tomorrow.",
      time: "07:20am",
      sender: "other",
    },
    {
      id: 5,
      text: "Let’s discuss this tomorrow. Let’s discuss this tomorrow.",
      time: "07:20am",
      sender: "me",
    },
    {
      id: 6,
      text: "Let’s discuss this tomorrow. Let’s discuss this tomorrow.",
      time: "07:20am",
      sender: "me",
    },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* DATE SEPARATOR */}
      <div className="flex justify-center">
        <span className="text-xs bg-[#22242A] text-white px-3 py-1 rounded">
          June 5th, 2024
        </span>
      </div>

      {messages.map((msg) => {
        const isother = msg.sender === "other";

        return (
          <div
            key={msg.id}
            className={`flex ${isother ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`
                max-w-[60%] p-3 border border-[#ABADB2] bg-[#DADBDD] text-[14px] leading-tight
                ${
                  isother
                    ? "rounded-xl rounded-tl-none"
                    : "rounded-xl rounded-tr-none"
                }
              `}
            >
              <p>{msg.text}</p>
              <p className="text-right text-[11px] text-[#ABADB2] mt-1">
                {msg.time}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
