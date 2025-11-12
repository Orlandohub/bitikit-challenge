"use client";

import { useEffect, useState } from "react";
import { AlertCircle, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BannerVariant = "error" | "offline";

interface NotificationBannerProps {
  message: string;
  variant: BannerVariant;
  onRetry?: () => void;
  onDismiss?: () => void;
  autoDismissMs?: number;
  className?: string;
}

const iconMap: Record<BannerVariant, typeof AlertCircle> = {
  error: AlertCircle,
  offline: WifiOff,
};

const variantStyles = {
  error:
    "border-destructive/40 bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive-foreground",
  offline:
    "border-amber-400/40 bg-amber-100/60 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200",
} satisfies Record<BannerVariant, string>;

export function NotificationBanner({
  message,
  variant,
  onRetry,
  onDismiss,
  autoDismissMs,
  className,
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!autoDismissMs) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, autoDismissMs);

    return () => window.clearTimeout(timer);
  }, [autoDismissMs, onDismiss]);

  useEffect(() => {
    setIsVisible(true);
  }, [variant, message]);

  if (!isVisible) {
    return null;
  }

  const Icon = iconMap[variant];

  return (
    <div
      role="status"
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-md border px-4 py-3 text-sm shadow-sm transition-all",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <p className="font-medium">{message}</p>
      </div>
      <div className="flex items-center gap-2">
        {onRetry ? (
          <Button
            size="sm"
            variant={variant === "error" ? "destructive" : "outline"}
            onClick={onRetry}
          >
            Retry
          </Button>
        ) : null}
        {onDismiss ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsVisible(false);
              onDismiss();
            }}
          >
            Dismiss
          </Button>
        ) : null}
      </div>
    </div>
  );
}
