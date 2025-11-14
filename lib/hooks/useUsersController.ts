"use client";

import { useCallback, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import type { BannerVariant } from "@/components/notification-banner";
import { fetchUsers } from "@/lib/api";
import {
  getFavoritesMap,
  getUsersByPage,
  saveUsers,
  toggleFavorite,
} from "@/lib/db-operations";
import { Env } from "@/lib/env";
import { useUIStore } from "@/lib/ui-store";

const RESULTS_PER_PAGE = Env.NEXT_PUBLIC_DEFAULT_RESULTS_PER_PAGE;

export function useUsersController() {
  const {
    pagination,
    status,
    setLoading,
    setOffline,
    setError,
    clearError,
    setCurrentPage,
    setTotalPages,
    isManualOffline,
    setManualOffline,
  } = useUIStore();

  const userRecords = useLiveQuery(
    () => getUsersByPage(pagination.currentPage, RESULTS_PER_PAGE),
    [pagination.currentPage]
  );
  const users = userRecords ?? [];

  const hasUsers = users.length > 0;
  const isLoadingUsers = status.isLoading || userRecords === undefined;
  const shouldShowSkeleton = isLoadingUsers && !hasUsers;

  const bannerVariant: BannerVariant | null = status.error
    ? "error"
    : status.isOffline
    ? "offline"
    : null;
  const bannerMessage =
    status.error ??
    (status.isOffline ? "You are offline. Showing cached users." : null);

  const syncUsers = useCallback(async (page: number) => {
    const favorites = await getFavoritesMap();
    const fetchedUsers = await fetchUsers({
      page,
      results: RESULTS_PER_PAGE,
      favoritesMap: favorites,
    });
    await saveUsers(fetchedUsers);
  }, []);

  const loadUsers = useCallback(
    async (
      page: number,
      { useCacheOnly = false }: { useCacheOnly?: boolean } = {}
    ) => {
      if (useCacheOnly || isManualOffline) {
        setOffline(true);
        return;
      }

      setLoading(true);
      clearError();

      try {
        setOffline(false);

        await syncUsers(page);
      } catch (error) {
        console.error("Failed to load users:", error);

        const cachedUsers = await getUsersByPage(page, RESULTS_PER_PAGE);

        if (cachedUsers.length === 0) {
          setError("Unable to fetch users. Please try again later.");
        }

        setOffline(true);
      } finally {
        setLoading(false);
      }
    },
    [clearError, setError, setLoading, setOffline, syncUsers, isManualOffline]
  );

  useEffect(() => {
    setTotalPages(Env.NEXT_PUBLIC_DEFAULT_TOTAL_PAGES);

    loadUsers(pagination.currentPage, { useCacheOnly: isManualOffline }).catch(
      (error) => console.error("Error on initial load:", error)
    );

    return undefined;
  }, [loadUsers, setTotalPages, pagination.currentPage, isManualOffline]);

  const handlePageChange = useCallback(
    async (page: number) => {
      setCurrentPage(page);
      await loadUsers(page, { useCacheOnly: isManualOffline });
    },
    [isManualOffline, loadUsers, setCurrentPage]
  );

  const handleRetry = useCallback(async () => {
    await loadUsers(pagination.currentPage, { useCacheOnly: isManualOffline });
  }, [isManualOffline, loadUsers, pagination.currentPage]);

  const handleToggleFavorite = useCallback(
    async (userId: string, nextValue: boolean) => {
      await toggleFavorite(userId, nextValue);
    },
    []
  );

  const handleOfflineToggle = useCallback(async () => {
    const nextValue = !isManualOffline;
    setManualOffline(nextValue);
    await loadUsers(pagination.currentPage, { useCacheOnly: nextValue });
  }, [isManualOffline, loadUsers, pagination.currentPage, setManualOffline]);

  return {
    users,
    pagination,
    isManualOffline,
    bannerVariant,
    bannerMessage,
    isLoadingUsers,
    shouldShowSkeleton,
    isPaginationLoading: status.isLoading,
    hasError: Boolean(status.error),
    handlePageChange,
    handleRetry,
    handleOfflineToggle,
    handleToggleFavorite,
    dismissError: clearError,
  };
}
