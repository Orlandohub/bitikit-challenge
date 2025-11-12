import Dexie, { Table } from "dexie";

export interface UserRecord {
  id: string;
  title: string;
  page: number;
  order: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cell: string;
  streetName: string;
  streetNumber: number;
  city: string;
  state: string;
  country: string;
  pictureLarge: string;
  pictureThumbnail: string;
  isFavorite: boolean;
  fetchedAt: number;
}

export class AppDatabase extends Dexie {
  users!: Table<UserRecord, string>;

  constructor() {
    super("bitikit-users");

    this.version(1).stores({
      users: "&id, page, isFavorite, lastName, fetchedAt, [page+order]",
    });
  }
}

export const db = new AppDatabase();
