import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CrossIcon } from "../../../icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean; // New prop to control close button visibility
  isFullscreen?: boolean; // Default to false for backwards compatibility
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true, // Default to true for backwards compatibility
  isFullscreen = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const contentClasses = isFullscreen
    ? "w-full h-full"
    : "relative w-full rounded-[8px] bg-white";

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal" style={{ zIndex: 2147483647 }}>
      {!isFullscreen && (
        <div
          className="fixed inset-0 h-full w-full bg-[#0000004D]"
          onClick={onClose}
          style={{ zIndex: 2147483646 }}
        ></div>
      )}
      <div
        ref={modalRef}
        className={`${contentClasses}  ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 2147483647 }}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9.5 w-9.5 items-center justify-center rounded-full  sm:right-6 sm:top-6 sm:h-11 sm:w-11"
            style={{ zIndex: 2147483647 }}
          >
            <CrossIcon />
          </button>
        )}
        <div>{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
