import React, {useCallback, useEffect, useState} from "react";
import ChatInterface from "../components/chat/ChatInterface.tsx";
import ChatHistory from "../components/chat/ChatHistory.tsx";
import {Conversation, Message} from "../types/chat.types.ts";
import axios from "axios";
import {v4 as uuidv4} from "uuid";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

let chatHistory = [];
const allSessions = await axios.get(`${baseUrl}/api/sessions`);
for (let session of allSessions.data) {
  let sessionDetails = await axios.get(`${baseUrl}/api/history/${session}`);

  let userMessage = sessionDetails.data[0];
  let aiMessage = sessionDetails.data[1];

  userMessage.timestamp = new Date(Date.now() - 1000 * 60 * 5);
  aiMessage.timestamp = new Date(Date.now() - 1000 * 60 * 5);

  const conversation = {
    id: sessionDetails.data[1].session_id,
    title: "new chat",
    messages: [userMessage, aiMessage],
    lastActivity: new Date(Date.now() - 1000 * 60 * 5),
  };

  chatHistory.push(conversation);
}

// Fake data;
// const initialConversations: Conversation[] = [
//   {
//     id: uuidv4(),
//     title: "Hỏi về lỗi hệ thống",
//     messages: [
//       {
//         id: uuidv4(),
//         content: "Hệ thống của tôi đang gặp vấn đề gì?",
//         role: "user",
//         session_id: "6fa2a434-b496-476f-b40c-a0cf1a9de19a",
//         timestamp: new Date(Date.now() - 1000 * 60 * 5),
//       },
//       {
//         id: uuidv4(),
//         content: "Không có vấn đề gì cả",
//         role: "model",
//         session_id: "6fa2a434-b496-476f-b40c-a0cf1a9de19a",
//         timestamp: new Date(Date.now() - 1000 * 60 * 4),
//       },
//     ],
//     lastActivity: new Date(Date.now() - 1000 * 60 * 4),
//   },
//   {
//     id: uuidv4(),
//     title: "Lỗi này là gì?",
//     messages: [
//       {
//         id: uuidv4(),
//         content: "Lõi của HOST này là gì?",
//         role: "user",
//         session_id: null,
//         timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
//       },
//     ],
//     lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
//   },
// ];

const initialConversations: Conversation[] = chatHistory || [];

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

  const handleSendMessage = async (userMessage: string, conversationId: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      content: userMessage,
      role: "user",
      session_id: conversationId || null,
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

      const aiResponseResult = await axios.post(`${baseUrl}/api/chat`, {
        message: userMessage,
        session_id: conversationId || null,
      });

      // sessionId = aiResponseResult.data.session_id;

      // const aiResponseText = `AI đã nhận được: "${userMessage}". Đây là câu trả lời mẫu.`;
      const aiResponseText = aiResponseResult.data.ai_reply;
      const aiTypingMessage: Message = {
        id: uuidv4(), // ID tạm thời cho typing
        content: aiResponseText || "Không thể lấy câu trả lời từ AI.",
        role: "model",
        session_id: conversationId || null,
        timestamp: new Date(),
      };
      setTypingMessage(aiTypingMessage);

      // Simulate typing duration based on text length
      const typingDuration = aiResponseText != undefined ? aiResponseText.length * 50 + 500 : 0; // 50ms per char + 500ms base

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
                  msg.content.toLowerCase().includes(lowerCaseTerm)
              )
          )
        );
      }
    },
    [allConversations]
  );

  const handleDeleteConversation = async (idToDelete: string) => {
    try {
      setAllConversations((prev) =>
          prev.filter((conv) => conv.id !== idToDelete)
      );

      if (currentConversationId === idToDelete) {
        const deleteConversationResult = await axios.delete(`${baseUrl}/api/session/${idToDelete}`);

        if (deleteConversationResult.status === 204) {
          const remainingConversations = allConversations.filter(
              (conv) => conv.id !== idToDelete
          );

          if (remainingConversations.length > 0) {
            const sortedRemaining = [...remainingConversations].sort(
                (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()
            );
            setCurrentConversationId(sortedRemaining[0].id);
          } else {
            setCurrentConversationId(null);
          }
        } else {
          throw new Error('Failed to delete conversation');
        }
      }
    } catch (error) {
      // Rollback the conversation deletion if API call fails
      setAllConversations((prev) => {
        const conversationToRestore = prev.find(conv => conv.id === idToDelete);
        return conversationToRestore ? [...prev, conversationToRestore] : prev;
      });
      console.error('Error deleting conversation:', error);
    }
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
