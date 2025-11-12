"use client";

import { useMemo } from "react";
import { Heart } from "lucide-react";
import clsx from "clsx";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types";

interface UserCardProps {
  user: User;
  onToggleFavorite: (userId: string, nextValue: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function UserCard({
  user,
  onToggleFavorite,
  disabled = false,
  className,
}: UserCardProps) {
  const initials = useMemo(() => {
    const first = user.firstName?.charAt(0).toUpperCase() ?? "";
    const last = user.lastName?.charAt(0).toUpperCase() ?? "";
    return `${first}${last}` || "??";
  }, [user.firstName, user.lastName]);

  const locationLabel = `${user.location.city}, ${user.location.state}, ${user.location.country}`;

  const handleFavoriteClick = () => {
    if (disabled) {
      return;
    }

    onToggleFavorite(user.id, !user.isFavorite);
  };

  return (
    <Card className={clsx("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar.large} alt={user.firstName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">
              {user.firstName} {user.lastName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button
          aria-label={
            user.isFavorite ? "Remove from favorites" : "Add to favorites"
          }
          variant={user.isFavorite ? "default" : "outline"}
          size="icon"
          disabled={disabled}
          onClick={handleFavoriteClick}
          className={clsx(
            "transition-colors",
            user.isFavorite && "bg-rose-500 hover:bg-rose-500 text-white"
          )}
        >
          <Heart
            className="h-4 w-4"
            aria-hidden="true"
            fill={user.isFavorite ? "currentColor" : "transparent"}
          />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{user.title || "User"}</Badge>
          <span className="text-sm text-muted-foreground">{locationLabel}</span>
        </div>
        <div className="grid gap-2 text-sm">
          <InfoRow label="Phone" value={user.phone} />
          <InfoRow label="Cell" value={user.cell} />
          <InfoRow
            label="Address"
            value={`${user.location.street.number} ${user.location.street.name}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
