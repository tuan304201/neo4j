import React from "react";
import { Message } from "../../types/chat.types.ts";
import TypingEffect from "./TypingEffect";

interface MessageBubbleProps {
  message: Message;
  isTyping?: boolean; // Dành cho tin nhắn AI đang gõ
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isTyping }) => {
  const isUser = message.sender === "user";

  return (
    <div className={`flex mb-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
          isUser ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-200 text-gray-800 rounded-bl-none"
        }`}
      >
        {isTyping && message.sender === "ai" ? (
          <TypingEffect text={message.text} />
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        )}
        <span className={`text-xs mt-1 block ${isUser ? "text-blue-200" : "text-gray-500"} text-right`}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
