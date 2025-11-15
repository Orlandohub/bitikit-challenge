import { db, type UserRecord } from "@/features/users/db";
import type { User } from "@/lib/types";

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
  const favorites = await db.users
    .filter((user) => Boolean(user.isFavorite))
    .toArray();
  return favorites.reduce<Record<string, boolean>>((acc, user) => {
    acc[user.id] = true;
    return acc;
  }, {});
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
