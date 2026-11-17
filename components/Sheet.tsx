"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { clsx } from "clsx";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Optional trailing action button shown in the sheet header (e.g. "Done") */
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  /** Optional leading action (e.g. "Cancel"). Defaults to a close X. */
  leadingAction?: {
    label: string;
    onClick: () => void;
  };
  /** Optional max height — defaults to 90vh */
  maxHeight?: string;
  /** Hide the grabber pill at the top */
  hideGrabber?: boolean;
  children: React.ReactNode;
  className?: string;
}

// Threshold for dismissing the sheet on drag-down (pixels)
const DISMISS_DISTANCE = 100;
// Velocity threshold — quick flick down also dismisses
const DISMISS_VELOCITY = 0.5; // px / ms

/**
 * iOS-style bottom sheet.
 *
 * Renders a dimmed backdrop and a sheet that slides up from the bottom with
 * rounded top corners (28px) and a grabber pill at the top.
 *
 * Dismissal:
 *   - Tap the backdrop
 *   - Press Escape
 *   - Tap the leading X / Cancel button
 *   - Drag the grabber/header down past ~100px or flick down quickly
 *
 * Body scroll is locked while open.
 */
export default function Sheet({
  open,
  onClose,
  title,
  primaryAction,
  leadingAction,
  maxHeight = "90vh",
  hideGrabber = false,
  children,
  className,
}: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    startY: 0,
    startT: 0,
    isDragging: false,
    lastY: 0,
    lastT: 0,
  });
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Reset drag state whenever sheet opens
  useEffect(() => {
    if (open) {
      setDragOffset(0);
      setIsAnimating(false);
    }
  }, [open]);

  const handleStart = useCallback((clientY: number) => {
    dragState.current = {
      startY: clientY,
      startT: performance.now(),
      isDragging: true,
      lastY: clientY,
      lastT: performance.now(),
    };
    setIsAnimating(false);
  }, []);

  const handleMove = useCallback((clientY: number) => {
    if (!dragState.current.isDragging) return;
    const delta = clientY - dragState.current.startY;
    // Only allow downward dragging
    if (delta > 0) {
      setDragOffset(delta);
    } else {
      setDragOffset(0);
    }
    dragState.current.lastY = clientY;
    dragState.current.lastT = performance.now();
  }, []);

  const handleEnd = useCallback(() => {
    if (!dragState.current.isDragging) return;
    dragState.current.isDragging = false;

    const { startY, startT, lastY, lastT } = dragState.current;
    const totalDelta = lastY - startY;
    const elapsed = Math.max(lastT - startT, 1);
    const velocity = totalDelta / elapsed; // px/ms, positive = downward

    setIsAnimating(true);

    if (totalDelta > DISMISS_DISTANCE || velocity > DISMISS_VELOCITY) {
      // Animate the sheet fully off-screen then call onClose
      const sheetHeight = sheetRef.current?.offsetHeight || 800;
      setDragOffset(sheetHeight);
      // Allow CSS transition to play before unmounting
      setTimeout(() => {
        onClose();
      }, 220);
    } else {
      // Snap back to 0
      setDragOffset(0);
    }
  }, [onClose]);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientY);
  const onTouchEnd = () => handleEnd();

  // Mouse handlers — for desktop testing
  useEffect(() => {
    if (!dragState.current.isDragging) return;
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const onMouseUp = () => handleEnd();
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [handleMove, handleEnd, dragOffset]);

  const onMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientY);
  };

  if (!open) return null;

  // Backdrop opacity follows drag progress for a nice tactile feel
  const dragProgress = Math.min(dragOffset / 300, 1);
  const backdropOpacity = 0.5 * (1 - dragProgress * 0.6);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "sheet-title" : undefined}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black animate-backdrop-in"
        style={{ opacity: backdropOpacity }}
      />

      {/* Sheet container */}
      <div
        ref={sheetRef}
        className={clsx(
          "relative w-full max-w-2xl bg-bg-base animate-slide-up flex flex-col",
          "rounded-t-[28px] overflow-hidden",
          "pb-safe",
          isAnimating && "transition-transform duration-200 ease-out",
          className
        )}
        style={{
          maxHeight,
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
        }}
      >
        {/* Drag area — grabber + header */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          className="cursor-grab active:cursor-grabbing select-none"
          style={{ touchAction: "none" }}
        >
          {/* Grabber pill */}
          {!hideGrabber && (
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-9 h-[5px] rounded-full bg-slate-600/80" />
            </div>
          )}

          {/* Header row */}
          {(title || primaryAction || leadingAction) && (
            <div className="relative flex items-center justify-between px-4 py-3 ios-hairline-bottom">
              {/* Leading */}
              <div className="min-w-[64px] flex items-center">
                {leadingAction ? (
                  <button
                    type="button"
                    onClick={leadingAction.onClick}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="text-[17px] text-primary font-normal ios-press"
                  >
                    {leadingAction.label}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    aria-label="Close"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700/60 text-slate-300 ios-press"
                  >
                    <X className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </button>
                )}
              </div>

              {/* Title (centered) */}
              {title && (
                <h2
                  id="sheet-title"
                  className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold text-white"
                >
                  {title}
                </h2>
              )}

              {/* Trailing */}
              <div className="min-w-[64px] flex justify-end">
                {primaryAction && (
                  <button
                    type="button"
                    onClick={primaryAction.onClick}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    disabled={primaryAction.disabled}
                    className={clsx(
                      "text-[17px] font-semibold ios-press disabled:opacity-40 disabled:active:transform-none",
                      "text-primary"
                    )}
                  >
                    {primaryAction.label}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
