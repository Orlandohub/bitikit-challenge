"use client";

import { Wifi, WifiOff } from "lucide-react";

import { NotificationBanner } from "@/components/notification-banner";
import { Pagination } from "@/components/pagination";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserGrid } from "@/components/user-grid";
import { Button } from "@/components/ui/button";
import { useUsersController } from "@/lib/hooks/useUsersController";

export default function Home() {
  const {
    users,
    pagination,
    isManualOffline,
    bannerVariant,
    bannerMessage,
    isLoadingUsers,
    shouldShowSkeleton,
    isPaginationLoading,
    hasError,
    handlePageChange,
    handleRetry,
    handleOfflineToggle,
    handleToggleFavorite,
    dismissError,
  } = useUsersController();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Random Users
          </h1>
          <p className="text-muted-foreground">
            Browse users fetched from randomuser.me with offline support and
            local favorites.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={isManualOffline ? "default" : "outline"}
            onClick={handleOfflineToggle}
            aria-pressed={isManualOffline}
          >
            {isManualOffline ? (
              <>
                <WifiOff className="mr-2 h-4 w-4" aria-hidden="true" />
                Offline mode
              </>
            ) : (
              <>
                <Wifi className="mr-2 h-4 w-4" aria-hidden="true" />
                Go offline
              </>
            )}
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {bannerVariant && bannerMessage ? (
        <NotificationBanner
          variant={bannerVariant}
          message={bannerMessage}
          onRetry={hasError ? handleRetry : undefined}
          onDismiss={hasError ? dismissError : undefined}
        />
      ) : null}

      <section aria-busy={isLoadingUsers}>
        <UserGrid
          users={users}
          isLoading={shouldShowSkeleton}
          onToggleFavorite={handleToggleFavorite}
        />
      </section>

      <footer className="mt-auto flex items-center justify-center border-t border-border pt-6">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          isLoading={isPaginationLoading}
        />
      </footer>
    </main>
  );
}
