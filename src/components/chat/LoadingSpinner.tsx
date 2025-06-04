import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-0"></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-200"></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-400"></div>
      <span className="text-sm text-gray-500">AI đang suy nghĩ...</span>
    </div>
  );
};

export default LoadingSpinner;
