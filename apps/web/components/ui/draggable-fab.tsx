"use client";

import * as React from "react";
import { Plus, Sparkles, Receipt, TrendingUp, Target } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLiveModePreference } from "@/components/providers/live-mode-provider";

export interface DraggableFabProps {
  /** Optional custom icon element */
  icon?: React.ReactNode;
  /** Hover tooltip text */
  tooltip?: string;
  /** Custom click callback. If not provided, defaults to opening the quick action floating panel */
  onClick?: () => void;
  /** Initial offset from bottom in pixels */
  initialBottomOffset?: number;
  /** Initial offset from right in pixels */
  initialRightOffset?: number;
}

export function DraggableFab({
  icon,
  tooltip = "Quick Actions",
  onClick,
  initialBottomOffset = 32,
  initialRightOffset = 24,
}: DraggableFabProps) {
  const { isLiveMode, mounted } = useLiveModePreference();
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isMoved, setIsMoved] = React.useState(false);
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);

  // Drag state refs to avoid closure stale state in event listeners
  const dragStartRef = React.useRef<{
    startX: number;
    startY: number;
    posX: number;
    posY: number;
  }>({ startX: 0, startY: 0, posX: 0, posY: 0 });

  // Initialize position on client mount
  React.useEffect(() => {
    const updateInitialPos = () => {
      const buttonWidth = buttonRef.current?.offsetWidth || 56;
      const buttonHeight = buttonRef.current?.offsetHeight || 56;
      const initialX = Math.max(16, window.innerWidth - buttonWidth - initialRightOffset);
      const initialY = Math.max(16, window.innerHeight - buttonHeight - initialBottomOffset);

      setPosition((prev) => {
        if (!prev) return { x: initialX, y: initialY };
        // Clamp existing position to new viewport bounds
        const clampedX = Math.min(Math.max(12, prev.x), window.innerWidth - buttonWidth - 12);
        const clampedY = Math.min(Math.max(12, prev.y), window.innerHeight - buttonHeight - 12);
        return { x: clampedX, y: clampedY };
      });
    };

    updateInitialPos();
    window.addEventListener("resize", updateInitialPos);
    return () => window.removeEventListener("resize", updateInitialPos);
  }, [initialBottomOffset, initialRightOffset]);

  // Drag logic handling Mouse and Touch events
  const handlePointerDown = (clientX: number, clientY: number) => {
    if (!position) return;
    setIsDragging(true);
    setIsMoved(false);

    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handlePointerMove = React.useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return;

      const deltaX = clientX - dragStartRef.current.startX;
      const deltaY = clientY - dragStartRef.current.startY;

      if (Math.hypot(deltaX, deltaY) > 5) {
        setIsMoved(true);
      }

      const buttonWidth = buttonRef.current?.offsetWidth || 56;
      const buttonHeight = buttonRef.current?.offsetHeight || 56;

      const minX = 12;
      const maxX = window.innerWidth - buttonWidth - 12;
      const minY = 12;
      const maxY = window.innerHeight - buttonHeight - 12;

      const newX = Math.min(Math.max(minX, dragStartRef.current.posX + deltaX), maxX);
      const newY = Math.min(Math.max(minY, dragStartRef.current.posY + deltaY), maxY);

      setPosition({ x: newX, y: newY });
    },
    [isDragging]
  );

  const handlePointerUp = React.useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (!isMoved) {
      if (onClick) {
        onClick();
      } else {
        setIsPanelOpen(true);
      }
    }
  }, [isDragging, isMoved, onClick]);

  // Mouse Handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Primary click only
    handlePointerDown(e.clientX, e.clientY);
  };

  // Touch Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      handlePointerDown(touch.clientX, touch.clientY);
    }
  };

  // Attach global event listeners during dragging
  React.useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onMouseUp = () => handlePointerUp();

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        handlePointerMove(touch.clientX, touch.clientY);
      }
    };
    const onTouchEnd = () => handlePointerUp();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  if (!mounted || !isLiveMode) {
    return null;
  }

  return (
    <>
      <div
        id="mc-tracker-web-fab"
        data-mc-tracker-fab="true"
        className="fixed z-50 transition-transform duration-75 select-none touch-none"
        style={{
          left: position ? `${position.x}px` : "auto",
          top: position ? `${position.y}px` : "auto",
          bottom: !position ? `${initialBottomOffset}px` : "auto",
          right: !position ? `${initialRightOffset}px` : "auto",
          visibility: position ? "visible" : "hidden",
        }}
      >
        <div className="relative group">
          {/* Tooltip on Hover */}
          {tooltip && (
            <div className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-foreground/90 px-2.5 py-1 text-xs font-semibold text-background opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 dark:bg-card dark:text-foreground">
              {tooltip}
            </div>
          )}

          {/* Floating Action Button */}
          <button
            ref={buttonRef}
            type="button"
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            aria-label={tooltip}
            className={`flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:scale-105 active:scale-95 ${
              isDragging ? "cursor-grabbing shadow-2xl scale-105" : "cursor-grab"
            }`}
          >
            {icon ? (
              icon
            ) : (
              <Plus
                className={`h-6 w-6 transition-transform duration-200 ${
                  isPanelOpen ? "rotate-45" : "rotate-0"
                }`}
              />
            )}
          </button>
        </div>
      </div>

      {/* Placeholder Quick Action Panel / Dialog */}
      <Dialog open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Quick Actions
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-3 sm:grid-cols-3">
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col items-center justify-center gap-2 rounded-xl border-border/80 hover:border-primary hover:bg-primary/5"
              onClick={() => setIsPanelOpen(false)}
            >
              <Link href="/costs">
                <Receipt className="h-5 w-5 text-rose-500" />
                <span className="text-xs font-semibold">Log Expense</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-20 flex-col items-center justify-center gap-2 rounded-xl border-border/80 hover:border-primary hover:bg-primary/5"
              onClick={() => setIsPanelOpen(false)}
            >
              <Link href="/income">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <span className="text-xs font-semibold">Log Income</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-20 flex-col items-center justify-center gap-2 rounded-xl border-border/80 hover:border-primary hover:bg-primary/5"
              onClick={() => setIsPanelOpen(false)}
            >
              <Link href="/plans">
                <Target className="h-5 w-5 text-blue-500" />
                <span className="text-xs font-semibold">Create Plan</span>
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
