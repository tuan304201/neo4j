import React, { useState, useEffect, useCallback } from "react";
import ChatInterface from "../components/chat/ChatInterface.tsx";
import ChatHistory from "../components/chat/ChatHistory.tsx";
import { Conversation, Message } from "../types/chat.types.ts";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenAI } from "@google/genai";

const genAi = new GoogleGenAI({ apiKey: "" });

// Fake data
const initialConversations: Conversation[] = [
  {
    id: uuidv4(),
    title: "Hỏi về lỗi hệ thống",
    messages: [
      {
        id: uuidv4(),
        text: "Hệ thống của tôi đang gặp vấn đề gì?",
        sender: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        id: uuidv4(),
        text: "Không có vấn đề gì cả",
        sender: "ai",
        timestamp: new Date(Date.now() - 1000 * 60 * 4),
      },
    ],
    lastActivity: new Date(Date.now() - 1000 * 60 * 4),
  },
  {
    id: uuidv4(),
    title: "Lỗi này là gì?",
    messages: [
      {
        id: uuidv4(),
        text: "Lõi của HOST này là gì?",
        sender: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
    ],
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
];

// const initialConversations: Conversation[] = [];

const ChatAi: React.FC = () => {
  const [allConversations, setAllConversations] =
    useState<Conversation[]>(initialConversations);
  const [filteredConversations, setFilteredConversations] =
    useState<Conversation[]>(initialConversations);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(initialConversations[0]?.id || null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState<Message | null>(null); // Tin nhắn AI đang gõ

  const currentConversation = filteredConversations.find(
    (conv) => conv.id === currentConversationId
  );

  const handleSendMessage = async (text: string, conversationId: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      text,
      sender: "user",
      timestamp: new Date(),
    };

    setAllConversations(
      (prev) =>
        prev
          .map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  lastActivity: new Date(),
                }
              : conv
          )
          .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()) // Sắp xếp lại
    );

    // Simulate AI response
    setIsAILoading(true);
    setTypingMessage(null); // Xóa tin nhắn đang gõ cũ (nếu có)

    setTimeout(async () => {
      setIsAILoading(false);
      setIsAITyping(true);

      // const aiResponseText = `AI đã nhận được: "${text}". Đây là câu trả lời mẫu.`;
      const aiResponseText = await genAi.models.generateContent({
        model: "gemini-2.0-flash",
        contents: text,
      });
      const aiTypingMessage: Message = {
        id: uuidv4(), // ID tạm thời cho typing
        text: aiResponseText.text || "Không thể lấy câu trả lời từ AI.",
        sender: "ai",
        timestamp: new Date(),
      };
      setTypingMessage(aiTypingMessage);

      // Simulate typing duration based on text length
      const typingDuration = aiResponseText.text != undefined ? aiResponseText.text.length * 50 + 500 : 0; // 50ms per char + 500ms base

      setTimeout(() => {
        const aiFinalMessage: Message = {
          ...aiTypingMessage,
          id: uuidv4(), // ID cuối cùng cho tin nhắn đã hoàn thành
        };

        setAllConversations((prev) =>
          prev
            .map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    messages: [...conv.messages, aiFinalMessage],
                    lastActivity: new Date(),
                  }
                : conv
            )
            .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
        );
        setIsAITyping(false);
        setTypingMessage(null);
      }, typingDuration);
    }, 1000); // AI starts "thinking"
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const handleCreateNewChat = () => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: `Cuộc trò chuyện mới ${new Date().toLocaleTimeString()}`,
      messages: [],
      lastActivity: new Date(),
    };
    setAllConversations((prev) => [newConversation, ...prev]); // Thêm vào đầu và sắp xếp
    setCurrentConversationId(newConversation.id);
  };

  const handleSearch = useCallback(
    (term: string) => {
      if (!term) {
        setFilteredConversations(allConversations);
      } else {
        const lowerCaseTerm = term.toLowerCase();
        setFilteredConversations(
          allConversations.filter(
            (conv) =>
              conv.title.toLowerCase().includes(lowerCaseTerm) ||
              conv.messages.some((msg) =>
                msg.text.toLowerCase().includes(lowerCaseTerm)
              )
          )
        );
      }
    },
    [allConversations]
  );

  const handleDeleteConversation = (idToDelete: string) => {
    setAllConversations((prev) =>
      prev.filter((conv) => conv.id !== idToDelete)
    );

    // Nếu cuộc trò chuyện đang được chọn bị xóa
    if (currentConversationId === idToDelete) {
      // Tìm cuộc trò chuyện mới để chọn (ví dụ: cuộc trò chuyện đầu tiên còn lại)
      const remainingConversations = allConversations.filter(
        (conv) => conv.id !== idToDelete
      );
      if (remainingConversations.length > 0) {
        // Sắp xếp lại theo lastActivity để chọn cuộc trò chuyện gần nhất
        const sortedRemaining = [...remainingConversations].sort(
          (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()
        );
        setCurrentConversationId(sortedRemaining[0].id);
      } else {
        setCurrentConversationId(null); // Không còn cuộc trò chuyện nào
      }
    }
    // Việc cập nhật filteredConversations sẽ được xử lý bởi useEffect theo dõi allConversations
  };

  // Update filteredConversations when allConversations changes
  useEffect(() => {
    const currentSearchTerm =
      (
        document.querySelector(
          'input[placeholder="Tìm kiếm đoạn chat..."]'
        ) as HTMLInputElement
      )?.value || "";
    handleSearch(currentSearchTerm);
    // Nếu không còn conversation nào và currentConversationId vẫn có giá trị, set nó về null
    if (allConversations.length === 0 && currentConversationId !== null) {
      setCurrentConversationId(null);
    } else if (allConversations.length > 0 && currentConversationId === null) {
      // Nếu có conversation nhưng chưa chọn, chọn cái đầu tiên (hoặc mới nhất)
      const sortedConversations = [...allConversations].sort(
        (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()
      );
      if (
        !currentConversationId ||
        !allConversations.find((c) => c.id === currentConversationId)
      ) {
        setCurrentConversationId(sortedConversations[0].id);
      }
    } else if (
      currentConversationId &&
      !allConversations.find((c) => c.id === currentConversationId)
    ) {
      // Nếu currentId không còn tồn tại trong allConversations (ví dụ sau khi xóa và không còn conv nào)
      // Thì chọn conv đầu tiên nếu có, hoặc null
      const sortedConversations = [...allConversations].sort(
        (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()
      );
      setCurrentConversationId(
        sortedConversations.length > 0 ? sortedConversations[0].id : null
      );
    }
  }, [allConversations, handleSearch, currentConversationId]);

  return (
    <div className="flex container-ai font-sans antialiased">
      <div className="flex-grow bg-white dark:bg-gray-850 rounded-xl rounded-br-none rounded-tr-none shadow-xl overflow-hidden flex flex-col">
        {" "}
        {/* Main Content - Chat Interface */}
        <ChatInterface
          currentConversation={currentConversation || null}
          onSendMessage={handleSendMessage}
          isAILoading={isAILoading}
          isAITyping={isAITyping}
          typingMessage={typingMessage}
        />
      </div>
      <div className="w-1/3 max-w-sm xl:w-1/4 bg-white dark:bg-gray-850 rounded-xl rounded-bl-none rounded-tl-none shadow-xl overflow-hidden flex flex-col">
        {" "}
        {/* Sidebar - Chat History */}
        <ChatHistory
          conversations={filteredConversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onCreateNewChat={handleCreateNewChat}
          onSearch={handleSearch}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>
    </div>
  );
};

export default ChatAi;
