import React, { useState } from "react";
import { Conversation } from "../../types/chat.types.ts";
import { MoreHorizontal, Trash2 } from "lucide-react";

interface ChatHistoryProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateNewChat: () => void;
  onSearch: (term: string) => void;
  onDeleteConversation: (id: string) => void; // Hàm callback mới để xóa
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onCreateNewChat,
  onSearch,
  onDeleteConversation, // Nhận hàm xóa
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Ngăn không cho sự kiện click lan ra div cha (chọn conversation)
    setActiveMenuId((prev) => (prev === id ? null : id));
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteConversation(id);
    setActiveMenuId(null); // Đóng menu sau khi xóa
  };

  // Đóng menu khi click ra ngoài
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (activeMenuId) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeMenuId]);

  return (
    <div className="flex flex-col h-full p-4 space-y-4 bg-gray-100">
      {" "}
      <input
        type="text"
        placeholder="Tìm kiếm đoạn chat..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-full px-3 text-sm py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
      />
      <button
        onClick={onCreateNewChat}
        className="w-full text-sm px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-offset-gray-800"
      >
        + Tạo đoạn chat mới
      </button>
      <div className="flex-grow overflow-y-auto space-y-2 pr-1 -mr-1">
        {" "}
        {/* pr-1 -mr-1 để thanh cuộn không che menu */}
        {conversations.length === 0 && !searchTerm && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">Chưa có đoạn chat nào.</p>
        )}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => {
              if (activeMenuId !== conv.id) {
                // Chỉ chọn khi menu không mở cho item này
                onSelectConversation(conv.id);
              }
            }}
            onMouseEnter={() => setHoveredItemId(conv.id)}
            onMouseLeave={() => setHoveredItemId(null)}
            className={`
              p-3 rounded-md cursor-pointer transition-colors relative group
              ${
                currentConversationId === conv.id && activeMenuId !== conv.id // Highlight nếu là current VÀ menu không mở
                  ? "bg-blue-100 dark:bg-blue-800/50 border border-blue-300 dark:border-blue-700"
                  : "bg-white dark:bg-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-600/70"
              }
            `}
          >
            <div className="flex justify-between items-center">
              <div className="flex-grow overflow-hidden mr-2">
                <h3 className="font-medium text-gray-800 dark:text-gray-100 truncate text-sm">{conv.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {conv.messages.length > 0
                    ? conv.messages[conv.messages.length - 1].content.substring(0, 30) +
                      (conv.messages[conv.messages.length - 1].content.length > 30 ? "..." : "")
                    : "Chưa có tin nhắn"}
                </p>
              </div>

              {/* Nút 3 chấm và Menu */}
              <div className="relative flex-shrink-0">
                {(hoveredItemId === conv.id || activeMenuId === conv.id) && (
                  <button
                    onClick={(e) => toggleMenu(e, conv.id)}
                    className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    aria-label="Tùy chọn"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                )}
                {activeMenuId === conv.id && (
                  <div
                    onClick={(e) => e.stopPropagation()} // Ngăn click vào menu đóng menu ngay lập tức
                    className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-750 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-600"
                  >
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      className="w-full flex items-center justify-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </button>
                    {/* Thêm các tùy chọn khác ở đây nếu cần */}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">
              {new Date(conv.lastActivity).toLocaleDateString()}
            </p>
          </div>
        ))}
        {conversations.length === 0 && searchTerm && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">Không tìm thấy kết quả.</p>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
