export interface RandomUserApiResponse {
  results: RandomUser[];
  info: {
    page: number;
    results: number;
    seed: string;
    version: string;
  };
}

export interface RandomUser {
  login: {
    uuid: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  email: string;
  phone: string;
  cell: string;
  location: {
    street: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: number | string;
    coordinates: {
      latitude: string;
      longitude: string;
    };
    timezone: {
      offset: string;
      description: string;
    };
  };
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
}

export interface User {
  id: string;
  title: string;
  page: number;
  order: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cell: string;
  location: {
    street: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
  };
  avatar: {
    large: string;
    thumbnail: string;
  };
  isFavorite: boolean;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  resultsPerPage: number;
}

export interface StatusState {
  isLoading: boolean;
  isInitialLoad: boolean;
  isOffline: boolean;
  error: string | null;
}
