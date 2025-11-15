"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import type { PaginationState, StatusState } from "./types";
import { Env } from "@/lib/env";

export const DEFAULT_RESULTS_PER_PAGE =
  Env.NEXT_PUBLIC_DEFAULT_RESULTS_PER_PAGE;
export const DEFAULT_TOTAL_PAGES = Env.NEXT_PUBLIC_DEFAULT_TOTAL_PAGES;

interface UIStoreState {
  pagination: PaginationState;
  status: StatusState;
  offlineModeEnabled: boolean;
  setCurrentPage: (page: number) => void;
  setLoading: (value: boolean) => void;
  setNetworkError: (value: boolean) => void;
  setError: (message: string | null) => void;
  clearError: () => void;
  setOfflineModeEnabled: (value: boolean) => void;
}

const initialState: Pick<
  UIStoreState,
  "pagination" | "status" | "offlineModeEnabled"
> = {
  pagination: {
    currentPage: 1,
    totalPages: DEFAULT_TOTAL_PAGES,
  },
  status: {
    isLoading: false,
    hasNetworkError: false,
    error: null,
  },
  offlineModeEnabled: false,
};

export const useUIStore = create<UIStoreState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setCurrentPage: (page) =>
          set((state) => ({
            pagination: {
              ...state.pagination,
              currentPage: page,
            },
          })),
        setLoading: (value) =>
          set((state) => ({
            status: {
              ...state.status,
              isLoading: value,
            },
          })),
        setNetworkError: (value) =>
          set((state) => ({
            status: {
              ...state.status,
              hasNetworkError: value,
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
        setOfflineModeEnabled: (value) =>
          set(() => ({
            offlineModeEnabled: value,
          })),
      }),
      {
        name: "ui-store",
        partialize: (state) => ({
          pagination: {
            currentPage: state.pagination.currentPage,
          },
          offlineModeEnabled: state.offlineModeEnabled,
        }),
        merge: (persistedState, currentState) => {
          const persisted = persistedState as Partial<UIStoreState>;

          return {
            ...currentState,
            ...persisted,
            pagination: {
              ...currentState.pagination,
              ...persisted?.pagination,
              totalPages:
                persisted?.pagination?.totalPages ??
                currentState.pagination.totalPages,
            },
            status: {
              ...currentState.status,
              ...persisted?.status,
            },
          };
        },
      }
    ),
    {
      name: "ui-store",
      enabled: process.env.NODE_ENV === "development",
      anonymousActionType: "UI_STORE",
    }
  )
);
