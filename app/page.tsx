"use client";

import { Wifi, WifiOff } from "lucide-react";

import { NotificationBanner } from "@/components/notification-banner";
import { Pagination } from "@/components/pagination";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserGrid } from "@/features/users/components/user-grid";
import { useUsers } from "@/features/users/useUsers";

export default function Home() {
  const {
    users,
    pagination,
    isOffline,
    offlineModeEnabled,
    bannerVariant,
    bannerMessage,
    isLoadingUsers,
    shouldShowSkeleton,
    isPaginationLoading,
    handlePageChange,
    handleOfflineToggle,
    handleToggleFavorite,
    dismissError,
  } = useUsers();

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
            variant={offlineModeEnabled ? "default" : "outline"}
            onClick={handleOfflineToggle}
            aria-pressed={offlineModeEnabled}
          >
            {offlineModeEnabled ? (
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

      {bannerVariant === "error" && bannerMessage ? (
        <NotificationBanner
          variant={bannerVariant}
          message={bannerMessage}
          onDismiss={dismissError}
        />
      ) : null}

      {!bannerVariant && isOffline ? (
        <div className="flex flex-col gap-3 rounded-md border border-amber-300/60 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
          <div className="font-medium">
            {offlineModeEnabled
              ? "Offline mode is enabled."
              : "You appear to be offline."}
          </div>
          <div className="text-sm text-amber-900/80 dark:text-amber-100/80">
            {offlineModeEnabled
              ? "Turn it off to sync with Random User again."
              : "We'll keep showing cached users and sync automatically once you are back online."}
          </div>
          {offlineModeEnabled ? (
            <div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleOfflineToggle}
              >
                Go back online
              </Button>
            </div>
          ) : null}
        </div>
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
