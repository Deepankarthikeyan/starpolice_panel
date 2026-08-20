import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

type AnchoredDropdownMenuProps = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  className: string;
  children: ReactNode;
  ariaLabel: string;
  role?: "listbox" | "menu";
  minWidth?: number;
  maxWidth?: number;
};

export function AnchoredDropdownMenu({
  open,
  anchorRef,
  onClose,
  className,
  children,
  ariaLabel,
  role = "listbox",
  minWidth,
  maxWidth,
}: AnchoredDropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({ visibility: "hidden" });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const viewportPadding = 12;
    const gap = 6;
    let left = rect.left;
    let width = Math.max(rect.width, minWidth ?? rect.width);

    if (maxWidth) {
      width = Math.min(width, maxWidth);
    } else {
      width = Math.min(width, window.innerWidth * 0.92);
    }

    if (left + width > window.innerWidth - viewportPadding) {
      left = Math.max(viewportPadding, window.innerWidth - viewportPadding - width);
    }

    setMenuStyle({
      position: "fixed",
      top: rect.bottom + gap,
      left,
      width,
      zIndex: 1080,
      visibility: "visible",
    });
  }, [anchorRef, maxWidth, minWidth]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition, children]);

  useEffect(() => {
    if (!open) return;

    function handleReposition() {
      updatePosition();
    }

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      onClose();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [anchorRef, onClose, open]);

  if (!open) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={`${className} spa-performance-dropdown-menu-portal`}
      style={menuStyle}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </div>,
    document.body,
  );
}
