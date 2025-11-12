import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { Pagination } from "./Pagination";

describe("Pagination", () => {
  it("returns null when only one page is available", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("navigates to next and previous pages", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />
    );

    fireEvent.click(screen.getByLabelText("Next page"));
    fireEvent.click(screen.getByLabelText("Previous page"));

    expect(onPageChange).toHaveBeenCalledTimes(2);
    expect(onPageChange).toHaveBeenNthCalledWith(1, 3);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 1);
  });

  it("disables navigation buttons when appropriate", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        isLoading
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByLabelText("Previous page")).toBeDisabled();
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });
});

describe("Pagination - Snapshots", () => {
  it("matches snapshot for middle window", () => {
    const { container } = render(
      <Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("matches snapshot with smaller window size", () => {
    const { container } = render(
      <Pagination
        currentPage={8}
        totalPages={12}
        pageWindow={2}
        onPageChange={vi.fn()}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
