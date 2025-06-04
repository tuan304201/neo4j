import React, { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from "react";
import { Message, Conversation } from "../../types/chat.types.ts";
import MessageBubble from "./MessageBubble";
import LoadingSpinner from "./LoadingSpinner";
import { SendHorizonal } from "lucide-react";

interface ChatInterfaceProps {
  currentConversation: Conversation | null;
  onSendMessage: (text: string, conversationId: string) => void;
  isAILoading: boolean;
  isAITyping: boolean;
  typingMessage: Message | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  currentConversation,
  onSendMessage,
  isAILoading,
  isAITyping,
  typingMessage,
}) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [currentConversation?.messages, isAITyping, typingMessage]);

  const handleSend = () => {
    if (inputText.trim() && currentConversation) {
      onSendMessage(inputText.trim(), currentConversation.id);
      setInputText("");
    }
  };

  const autoResizeTextarea = (element: HTMLTextAreaElement) => {
    // Reset height to shrink if text is deleted
    element.style.height = "auto";
    // Set new height based on scrollHeight
    element.style.height = `${element.scrollHeight}px`;

    // Optional: enforce maxHeight from style
    const maxHeightStyle = element.style.maxHeight;
    if (maxHeightStyle && maxHeightStyle.endsWith("px")) {
      const maxHeight = parseFloat(maxHeightStyle);
      if (element.scrollHeight > maxHeight) {
        element.style.height = `${maxHeight}px`;
        element.style.overflowY = "auto"; // Show scrollbar if content exceeds maxHeight
      } else {
        element.style.overflowY = "hidden";
      }
    } else if (maxHeightStyle && maxHeightStyle.endsWith("rem")) {
      // Handle rem if you set maxHeight in rem
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const maxHeight = parseFloat(maxHeightStyle) * rootFontSize;
      if (element.scrollHeight > maxHeight) {
        element.style.height = `${maxHeight}px`;
        element.style.overflowY = "auto";
      } else {
        element.style.overflowY = "hidden";
      }
    }
  };

  // Gọi autoResize khi component mount và khi inputText thay đổi (nếu inputText có thể thay đổi từ bên ngoài)
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Nếu bạn muốn tham chiếu trực tiếp

  useEffect(() => {
    if (textareaRef.current) {
      autoResizeTextarea(textareaRef.current);
    }
  }, [inputText]); // Chạy mỗi khi inputText thay đổi

  if (!currentConversation) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gray-50 dark:bg-gray-800 p-4">
        <p className="text-gray-500 dark:text-gray-400">Chọn một đoạn chat hoặc tạo mới để bắt đầu.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r dark:border-gray-700 ">
      {/* Header (tên đoạn chat) */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{currentConversation.title}</h2>
      </div>

      {/* Khung chat */}
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {currentConversation.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isAITyping && typingMessage && <MessageBubble message={typingMessage} isTyping={true} />}
        {isAILoading && <LoadingSpinner />}
        <div ref={messagesEndRef} />
      </div>

      {/* Khung nhập liệu - ĐÃ CẬP NHẬT */}
      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850">
        <div className="flex items-start space-x-2 bg-gray-100 dark:bg-gray-700/50 rounded-3xl p-1 sm:p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 transition-all duration-200">
          {" "}
          {/* items-start để button không bị kéo dãn khi textarea cao lên, rounded-3xl thay cho rounded-full */}
          <textarea
            value={inputText}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              // Thay đổi kiểu sự kiện
              setInputText(e.target.value);
              autoResizeTextarea(e.target); // Gọi hàm tự động thay đổi kích thước
            }}
            onKeyPress={(e: KeyboardEvent<HTMLTextAreaElement>) => {
              // Thay đổi kiểu sự kiện
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Nhập tin nhắn..."
            className="flex-grow px-3 sm:px-4 py-2.5 sm:py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm resize-none overflow-y-hidden" // Thêm resize-none và overflow-y-hidden
            disabled={isAILoading || isAITyping}
            rows={1} // rows={1} là chiều cao ban đầu
            style={{ minHeight: "2.75rem", maxHeight: "9rem" }} // Giới hạn chiều cao min/max, ví dụ
          />
          <button
            onClick={handleSend}
            disabled={isAILoading || isAITyping || !inputText.trim()}
            className={`
                p-2 sm:p-2.5 rounded-full transition-colors duration-200 ease-in-out
                flex items-center justify-center self-end mb-0.5 sm:mb-1
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50
                ${
                  !inputText.trim() || isAILoading || isAITyping
                    ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400"
                    : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                }
            `}
            aria-label="Gửi tin nhắn"
          >
            <SendHorizonal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
