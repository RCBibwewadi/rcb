"use client";
import { useEffect, useState } from "react";

interface PopupMessageProps {
  message: string;
  type: "success" | "error";
  duration?: number; // default 3s
  onClose?: () => void;
}

export default function PopupMessage({
  message,
  type,
  duration = 3000,
  onClose,
}: PopupMessageProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
        type === "success"
          ? "bg-green-600"
          : "bg-red-600"
      }`}
    >
      {message}
    </div>
  );
}
