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
  isManualOffline: boolean;
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setResultsPerPage: (results: number) => void;
  setLoading: (value: boolean) => void;
  setOffline: (value: boolean) => void;
  setError: (message: string | null) => void;
  clearError: () => void;
  setManualOffline: (value: boolean) => void;
  reset: () => void;
}

const initialState: Pick<
  UIStoreState,
  "pagination" | "status" | "isManualOffline"
> = {
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
  isManualOffline: false,
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
              isOffline: state.isManualOffline ? true : value,
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
        setManualOffline: (value) =>
          set((state) => ({
            isManualOffline: value,
            status: {
              ...state.status,
              isOffline: value ? true : state.status.isOffline,
            },
          })),
        reset: () => set(initialState),
      }),
      {
        name: "ui-store",
        partialize: (state) => ({
          pagination: {
            currentPage: state.pagination.currentPage,
          },
          isManualOffline: state.isManualOffline,
        }),
      }
    ),
    {
      name: "ui-store",
      enabled: process.env.NODE_ENV === "development",
      anonymousActionType: "UI_STORE",
    }
  )
);
