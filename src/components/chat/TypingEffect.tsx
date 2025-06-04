import React, { useState, useEffect } from "react";

interface TypingEffectProps {
  text: string;
  speed?: number;
  onFinished?: () => void;
}

const TypingEffect: React.FC<TypingEffectProps> = ({ text, speed = 10, onFinished }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText(""); // Reset when text changes
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeoutId);
    } else if (currentIndex === text.length && text.length > 0) {
      onFinished?.();
    }
  }, [currentIndex, text, speed, onFinished]);

  return <div className="text-sm">{displayedText}</div>;
};

export default TypingEffect;
