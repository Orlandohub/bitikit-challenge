import type { RandomUser, RandomUserApiResponse, User } from "./types";
import { Env } from "@/lib/env";

export interface FetchUsersOptions {
  page: number;
  results: number;
  seed?: string;
  favoritesMap?: Record<string, boolean>;
  signal?: AbortSignal;
}

export async function fetchUsers({
  page,
  results,
  seed = Env.NEXT_PUBLIC_RANDOM_USER_SEED,
  favoritesMap = {},
  signal,
}: FetchUsersOptions): Promise<User[]> {
  const requestUrl = createRequestUrl({
    page,
    results,
    seed,
    baseUrl: Env.NEXT_PUBLIC_RANDOM_USER_API,
  });

  const response = await fetch(requestUrl, {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users (status: ${response.status})`);
  }

  const payload = (await response.json()) as RandomUserApiResponse;

  return payload.results.map((randomUser, index) =>
    toUser(randomUser, {
      page,
      order: index,
      favoritesMap,
    })
  );
}

function createRequestUrl({
  page,
  results,
  seed,
  baseUrl,
}: {
  page: number;
  results: number;
  seed: string;
  baseUrl: string;
}): string {
  const url = new URL(baseUrl);
  url.searchParams.set("page", String(page));
  url.searchParams.set("results", String(results));
  url.searchParams.set("seed", seed);
  return url.toString();
}

function toUser(
  randomUser: RandomUser,
  params: {
    page: number;
    order: number;
    favoritesMap: Record<string, boolean>;
  }
): User {
  const id = randomUser.login.uuid;
  const favorite = params.favoritesMap[id] ?? false;

  return {
    id,
    title: randomUser.name.title,
    page: params.page,
    order: params.order,
    firstName: randomUser.name.first,
    lastName: randomUser.name.last,
    email: randomUser.email,
    phone: randomUser.phone,
    cell: randomUser.cell,
    location: {
      street: {
        number: randomUser.location.street.number,
        name: randomUser.location.street.name,
      },
      city: randomUser.location.city,
      state: randomUser.location.state,
      country: randomUser.location.country,
    },
    avatar: {
      large: randomUser.picture.large,
      thumbnail: randomUser.picture.thumbnail,
    },
    isFavorite: favorite,
  };
}
