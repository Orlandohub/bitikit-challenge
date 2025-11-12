"use client";

import { useUserStore } from "@/lib/store";
import type { User } from "@/lib/types";

import { UserCard } from "./user-card";
import { UserCardSkeleton } from "./user-card-skeleton";

interface UserGridProps {
  users?: User[];
  isLoading?: boolean;
  skeletonCount?: number;
  onToggleFavorite: (userId: string, nextValue: boolean) => void;
}

const DEFAULT_SKELETON_COUNT = 10;

export function UserGrid({
  users,
  isLoading = false,
  skeletonCount = DEFAULT_SKELETON_COUNT,
  onToggleFavorite,
}: UserGridProps) {
  const favorites = useUserStore((state) => state.favorites);

  if (isLoading && (!users || users.length === 0)) {
    return <LoadingGrid count={skeletonCount} />;
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
        <p className="text-lg font-medium">No users found</p>
        <p className="text-sm max-w-md">
          Try refreshing or adjusting your filters. Cached data might still be
          loading if you are offline.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={{
            ...user,
            isFavorite: favorites[user.id] ?? user.isFavorite,
          }}
          onToggleFavorite={onToggleFavorite}
          disabled={isLoading}
        />
      ))}
      {isLoading && <LoadingGrid count={Math.min(3, skeletonCount)} />}
    </div>
  );
}

function LoadingGrid({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <UserCardSkeleton key={`skeleton-${index}`} />
      ))}
    </>
  );
}
