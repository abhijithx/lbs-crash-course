import React, { ReactNode, useEffect } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
};

export function Modal({ isOpen, onClose, children, size = "md" }: ModalProps) {
  // Close modal on ESC key press
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose} // close if outside click
    >
      <div
        className={`bg-white rounded-lg shadow-lg p-6 max-w-full ${
          size === "sm"
            ? "w-64"
            : size === "md"
            ? "w-96"
            : size === "lg"
            ? "w-[640px]"
            : "w-[800px]"
        }`}
        onClick={(e) => e.stopPropagation()} // stop clicks inside modal from closing
      >
        {children}
      </div>
    </div>
  );
}
