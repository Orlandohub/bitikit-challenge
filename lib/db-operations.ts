import { Env } from "@/lib/env";

import { db, type UserRecord } from "./database";
import type { User } from "./types";

const DEFAULT_CACHE_MAX_AGE_MS = Env.NEXT_PUBLIC_CACHE_MAX_AGE_MS;

export async function saveUsers(users: User[], fetchedAt = Date.now()) {
  if (!users.length) {
    return;
  }

  const records = users.map<UserRecord>((user) => ({
    id: user.id,
    title: user.title,
    page: user.page,
    order: user.order,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    cell: user.cell,
    streetNumber: user.location.street.number,
    streetName: user.location.street.name,
    city: user.location.city,
    state: user.location.state,
    country: user.location.country,
    pictureLarge: user.avatar.large,
    pictureThumbnail: user.avatar.thumbnail,
    isFavorite: user.isFavorite,
    fetchedAt,
  }));

  await db.users.bulkPut(records);
}

export async function getUsersByPage(page: number, limit: number) {
  const records = await db.users
    .where("[page+order]")
    .between([page, 0], [page, Number.MAX_SAFE_INTEGER])
    .limit(limit)
    .sortBy("order");

  return records.map(toUser);
}

export async function toggleFavorite(userId: string, value: boolean) {
  await db.users.update(userId, { isFavorite: value });
}

export async function getFavoritesMap(): Promise<Record<string, boolean>> {
  const favorites = await db.users.where("isFavorite").equals(1).toArray();
  return favorites.reduce<Record<string, boolean>>((acc, user) => {
    acc[user.id] = true;
    return acc;
  }, {});
}

export async function isPageFresh(
  page: number,
  maxAgeMs = DEFAULT_CACHE_MAX_AGE_MS
) {
  const latestRecord = await db.users
    .where("page")
    .equals(page)
    .reverse()
    .sortBy("fetchedAt");

  if (!latestRecord.length) {
    return false;
  }

  const newestFetch = latestRecord[0].fetchedAt;
  return Date.now() - newestFetch < maxAgeMs;
}

export function toUser(record: UserRecord): User {
  return {
    id: record.id,
    title: record.title,
    page: record.page,
    order: record.order,
    firstName: record.firstName,
    lastName: record.lastName,
    email: record.email,
    phone: record.phone,
    cell: record.cell,
    location: {
      street: {
        number: record.streetNumber,
        name: record.streetName,
      },
      city: record.city,
      state: record.state,
      country: record.country,
    },
    avatar: {
      large: record.pictureLarge,
      thumbnail: record.pictureThumbnail,
    },
    isFavorite: record.isFavorite,
  };
}
