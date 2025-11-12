import { create } from "zustand";

import { Env } from "@/lib/env";
import type { PaginationState, StatusState, User } from "./types";

type FavoritesMap = Record<string, boolean>;

export const DEFAULT_RESULTS_PER_PAGE =
  Env.NEXT_PUBLIC_DEFAULT_RESULTS_PER_PAGE;
export const DEFAULT_TOTAL_PAGES = Env.NEXT_PUBLIC_DEFAULT_TOTAL_PAGES;

interface UserStore {
  users: User[];
  favorites: FavoritesMap;
  pagination: PaginationState;
  status: StatusState;
  setUsers: (users: User[]) => void;
  setFavoritesMap: (favorites: FavoritesMap) => void;
  toggleFavoriteLocal: (userId: string, value?: boolean) => boolean;
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setResultsPerPage: (results: number) => void;
  setLoading: (value: boolean) => void;
  setOffline: (value: boolean) => void;
  setError: (message: string | null) => void;
  clearError: () => void;
  setInitialLoadComplete: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  favorites: {},
  pagination: {
    currentPage: 1,
    totalPages: DEFAULT_TOTAL_PAGES,
    resultsPerPage: DEFAULT_RESULTS_PER_PAGE,
  },
  status: {
    isLoading: false,
    isInitialLoad: true,
    isOffline: false,
    error: null,
  },
  setUsers: (users) =>
    set((state) => ({
      users,
      favorites: {
        ...state.favorites,
        ...users.reduce<FavoritesMap>((acc, user) => {
          acc[user.id] = user.isFavorite;
          return acc;
        }, {}),
      },
      status: {
        ...state.status,
        isInitialLoad: false,
      },
    })),
  setFavoritesMap: (favorites) =>
    set((state) => ({
      favorites: {
        ...state.favorites,
        ...favorites,
      },
      users: state.users.map((user) =>
        favorites[user.id] !== undefined
          ? { ...user, isFavorite: favorites[user.id] ?? false }
          : user
      ),
    })),
  toggleFavoriteLocal: (userId, value) => {
    const nextValue = value ?? !get().favorites[userId];

    set((state) => ({
      favorites: {
        ...state.favorites,
        [userId]: nextValue,
      },
      users: state.users.map((user) =>
        user.id === userId ? { ...user, isFavorite: nextValue } : user
      ),
    }));

    return nextValue;
  },
  setCurrentPage: (page) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        currentPage: page,
      },
    })),
  setTotalPages: (total) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        totalPages: Math.max(total, state.pagination.currentPage),
      },
    })),
  setResultsPerPage: (results) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        resultsPerPage: results,
      },
    })),
  setLoading: (value) =>
    set((state) => ({
      status: {
        ...state.status,
        isLoading: value,
      },
    })),
  setOffline: (value) =>
    set((state) => ({
      status: {
        ...state.status,
        isOffline: value,
      },
    })),
  setError: (message) =>
    set((state) => ({
      status: {
        ...state.status,
        error: message,
      },
    })),
  clearError: () =>
    set((state) => ({
      status: {
        ...state.status,
        error: null,
      },
    })),
  setInitialLoadComplete: () =>
    set((state) => ({
      status: {
        ...state.status,
        isInitialLoad: false,
      },
    })),
}));
