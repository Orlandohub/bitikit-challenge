"use client";

import { useCallback, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import type { BannerVariant } from "@/components/notification-banner";
import { syncUsers } from "@/features/users/sync";
import { getUsersByPage, toggleFavorite } from "@/features/users/data";
import { Env } from "@/lib/env";
import { useUIStore } from "@/lib/ui-store";

const RESULTS_PER_PAGE = Env.NEXT_PUBLIC_DEFAULT_RESULTS_PER_PAGE;

export function useUsers() {
  const {
    pagination,
    status,
    setLoading,
    setNetworkError,
    setError,
    clearError,
    setCurrentPage,
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
  const isOffline = isManualOffline || status.hasNetworkError;

  const bannerVariant: BannerVariant | null = status.error ? "error" : null;
  const bannerMessage = status.error ?? null;

  const loadUsers = useCallback(
    async (
      page: number,
      { cacheOnly = false }: { cacheOnly?: boolean } = {}
    ) => {
      const shouldUseCacheOnly = cacheOnly || isManualOffline;

      if (shouldUseCacheOnly) {
        setNetworkError(false);
        return;
      }

      setLoading(true);
      clearError();
      setNetworkError(false);

      try {
        await syncUsers({ page, resultsPerPage: RESULTS_PER_PAGE });
      } catch (error) {
        console.error("Failed to load users:", error);

        const cachedUsers = await getUsersByPage(page, RESULTS_PER_PAGE);

        if (cachedUsers.length === 0) {
          setError("Unable to fetch users. Please try again later.");
        }

        setNetworkError(true);
      } finally {
        setLoading(false);
      }
    },
    [
      clearError,
      isManualOffline,
      setError,
      setLoading,
      setNetworkError,
    ]
  );

  useEffect(() => {
    loadUsers(pagination.currentPage).catch((error) =>
      console.error("Error loading users:", error)
    );
  }, [loadUsers, pagination.currentPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  const handleToggleFavorite = useCallback(
    async (userId: string, nextValue: boolean) =>
      toggleFavorite(userId, nextValue),
    []
  );

  const handleOfflineToggle = useCallback(() => {
    setManualOffline(!isManualOffline);
  }, [isManualOffline, setManualOffline]);

  return {
    users,
    pagination,
    isOffline,
    isManualOffline,
    bannerVariant,
    bannerMessage,
    isLoadingUsers,
    shouldShowSkeleton,
    isPaginationLoading: status.isLoading,
    handlePageChange,
    handleOfflineToggle,
    handleToggleFavorite,
    dismissError: clearError,
  };
}
