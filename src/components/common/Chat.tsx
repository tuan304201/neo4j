import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

interface ChatProps {
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

const Chat: React.FC<ChatProps> = ({ isOpen = true, onClose, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "bot", text: "Chào bạn! Tôi là AIOPS TECH, sẵn sàng hỗ trợ bạn.", time: "14:30" },
    { id: 2, sender: "user", text: "Chào AIOPS TECH! Bạn có thể làm gì?", time: "14:32" },
    {
      id: 3,
      sender: "bot",
      text: "Tôi có thể trả lời câu hỏi, kể chuyện, và thậm chí đưa ra vài lời khuyên hài hước!",
      time: "14:33",
    },
    {
      id: 4,
      sender: "user",
      text: "Đây là một tin nhắn rất dài để kiểm tra xem text có bị tràn ra ngoài ô không, hãy thử một chuỗi siêu dài không có khoảng cách như supercalifragilisticexpialidocioussupercalifragilisticexpialidocioussupercalifragilisticexpialidocious",
      time: "14:34",
    },
  ]);
  
  const [newMessage, setNewMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const userMessage: Message = {
        id: messages.length + 1,
        sender: "user",
        text: newMessage,
        time,
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      // Simulate bot response
      setTimeout(() => {
        const botMessage: Message = {
          id: messages.length + 2,
          sender: "bot",
          text: "Đang xử lý... Đây là câu trả lời giả từ AI!",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 1000);

      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Auto-scroll to bottom when new messages are added or loading state changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Chat popup */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-md h-[600px] flex flex-col relative">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h1 className="text-xl font-bold text-white">AIOPS TECH</h1>
            <div className="flex gap-2">
              {/* Minimize button */}
              {onToggle && (
                <button
                  onClick={onToggle}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded"
                  title="Minimize"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13H5v-2h14v2z"/>
                  </svg>
                </button>
              )}
              {/* Close button */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded"
                  title="Close"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
      
          {/* Chat area */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              scrollBehavior: 'smooth'
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg break-words ${
                    message.sender === 'user' ? 'bg-blue-600' : 'bg-gray-800'
                  }`}
                  style={{
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word',
                    wordBreak: 'break-word'
                  }}
                >
                  <p className="text-sm text-white">{message.text}</p>
                  <span className="text-xs text-gray-400">{message.time}</span>
                </div>
              </div>
            ))}
            
            {/* Loading spinner */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xs p-3 rounded-lg bg-gray-800 flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-sm text-gray-400">Đang xử lý...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-gray-700">
            <div className="relative">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyUp={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 pr-10 text-white focus:outline-none focus:border-gray-600 text-sm"
              />
              <button
                onClick={sendMessage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 p-1 rounded transition text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M20.33 3.67a1.45 1.45 0 0 0-1.47-.35L4.23 8.2A1.44 1.44 0 0 0 4 10.85l6.07 3l3 6.09a1.44 1.44 0 0 0 1.29.79h.1a1.43 1.43 0 0 0 1.26-1l4.95-14.59a1.41 1.41 0 0 0-.34-1.47M4.85 9.58l12.77-4.26l-7.09 7.09Zm9.58 9.57l-2.84-5.68l7.09-7.09Z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;