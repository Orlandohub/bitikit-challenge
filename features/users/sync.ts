"use client";

import { fetchUsers } from "@/features/users/api";
import { getFavoritesMap, saveUsers } from "@/features/users/data";

interface SyncUsersParams {
  page: number;
  resultsPerPage: number;
}

export async function syncUsers({ page, resultsPerPage }: SyncUsersParams) {
  const favorites = await getFavoritesMap();
  const fetchedUsers = await fetchUsers({
    page,
    results: resultsPerPage,
    favoritesMap: favorites,
  });

  await saveUsers(fetchedUsers);
}
