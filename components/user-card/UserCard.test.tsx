import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { UserCard } from "./UserCard";
import type { User } from "@/lib/types";

const mockUser: User = {
  id: "user-1",
  title: "Engineer",
  page: 1,
  order: 1,
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  phone: "123-456-7890",
  cell: "987-654-3210",
  location: {
    street: {
      number: 42,
      name: "Binary St",
    },
    city: "London",
    state: "Greater London",
    country: "UK",
  },
  avatar: {
    large: "https://example.com/ada-large.jpg",
    thumbnail: "https://example.com/ada-thumb.jpg",
  },
  isFavorite: false,
};

describe("UserCard", () => {
  it("renders user details", () => {
    render(<UserCard user={mockUser} onToggleFavorite={vi.fn()} />);

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(
      screen.getByText("London, Greater London, UK")
    ).toBeInTheDocument();
  });

  it("calls onToggleFavorite when favorite button is clicked", () => {
    const onToggleFavorite = vi.fn();

    render(<UserCard user={mockUser} onToggleFavorite={onToggleFavorite} />);

    fireEvent.click(screen.getByRole("button", { name: "Add to favorites" }));

    expect(onToggleFavorite).toHaveBeenCalledWith(mockUser.id, true);
  });

  it("does not toggle favorite when disabled", () => {
    const onToggleFavorite = vi.fn();

    render(
      <UserCard user={mockUser} onToggleFavorite={onToggleFavorite} disabled />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add to favorites" }));

    expect(onToggleFavorite).not.toHaveBeenCalled();
  });
});

describe("UserCard - Snapshots", () => {
  it("matches snapshot for default state", () => {
    const { container } = render(
      <UserCard user={mockUser} onToggleFavorite={vi.fn()} />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("matches snapshot when user is favorite", () => {
    const { container } = render(
      <UserCard
        user={{
          ...mockUser,
          isFavorite: true,
        }}
        onToggleFavorite={vi.fn()}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});

