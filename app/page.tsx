"use client";

import { useCallback, useEffect, useRef } from "react";

import { NotificationBanner } from "@/components/notification-banner";
import { Pagination } from "@/components/pagination";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserGrid } from "@/components/user-grid";
import { fetchUsers } from "@/lib/api";
import {
  getFavoritesMap,
  getUsersByPage,
  isPageFresh,
  saveUsers,
  toggleFavorite,
} from "@/lib/db-operations";
import { Env } from "@/lib/env";
import { useUserStore } from "@/lib/store";

const RESULTS_PER_PAGE = Env.NEXT_PUBLIC_DEFAULT_RESULTS_PER_PAGE;

export default function Home() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    users,
    pagination,
    status,
    setUsers,
    setLoading,
    setOffline,
    setError,
    clearError,
    setCurrentPage,
    setTotalPages,
    toggleFavoriteLocal,
  } = useUserStore();

  const hasUsers = users.length > 0;
  const bannerVariant = status.error
    ? "error"
    : status.isOffline
    ? "offline"
    : null;
  const bannerMessage =
    status.error ??
    (status.isOffline ? "You are offline. Showing cached users." : null);

  const handleAbortOngoingRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const loadUsers = useCallback(
    async (
      page: number,
      { useCacheOnly = false }: { useCacheOnly?: boolean } = {}
    ) => {
      setLoading(true);
      clearError();

      try {
        const cachedUsers = await getUsersByPage(page, RESULTS_PER_PAGE);

        if (cachedUsers.length > 0) {
          setUsers(cachedUsers);
        }

        if (useCacheOnly) {
          setOffline(true);
          return;
        }

        if (cachedUsers.length > 0 && (await isPageFresh(page))) {
          setOffline(false);
          return;
        }

        handleAbortOngoingRequest();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const favorites = await getFavoritesMap();
        const fetchedUsers = await fetchUsers({
          page,
          results: RESULTS_PER_PAGE,
          favoritesMap: favorites,
          signal: controller.signal,
        });

        await saveUsers(fetchedUsers);
        setUsers(fetchedUsers);
        setOffline(false);
      } catch (error) {
        console.error("Failed to load users:", error);

        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        const cachedUsers = await getUsersByPage(page, RESULTS_PER_PAGE);

        if (cachedUsers.length > 0) {
          setUsers(cachedUsers);
          setOffline(true);
        } else {
          setError("Unable to fetch users. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    },
    [
      clearError,
      setError,
      setLoading,
      setOffline,
      setUsers,
      handleAbortOngoingRequest,
    ]
  );

  useEffect(() => {
    setCurrentPage(1);
    setTotalPages(Env.NEXT_PUBLIC_DEFAULT_TOTAL_PAGES);

    loadUsers(1, { useCacheOnly: false }).catch((error) =>
      console.error("Error on initial load:", error)
    );

    return () => {
      handleAbortOngoingRequest();
    };
  }, [loadUsers, setCurrentPage, setTotalPages]);

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await loadUsers(page, { useCacheOnly: false });
  };

  const handleRetry = async () => {
    await loadUsers(pagination.currentPage, { useCacheOnly: false });
  };

  const handleToggleFavorite = async (userId: string, nextValue: boolean) => {
    toggleFavoriteLocal(userId, nextValue);
    await toggleFavorite(userId, nextValue);
  };

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
        <ThemeToggle />
      </header>

      {bannerVariant && bannerMessage ? (
        <NotificationBanner
          variant={bannerVariant}
          message={bannerMessage}
          onRetry={status.error ? handleRetry : undefined}
          onDismiss={status.error ? clearError : undefined}
        />
      ) : null}

      <section aria-busy={status.isLoading}>
        <UserGrid
          users={users}
          isLoading={status.isLoading && !hasUsers}
          onToggleFavorite={handleToggleFavorite}
        />
      </section>

      <footer className="mt-auto flex items-center justify-center border-t border-border pt-6">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          isLoading={status.isLoading}
        />
      </footer>
    </main>
  );
}
