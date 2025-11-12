import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react";

import { NotificationBanner } from "./NotificationBanner";

describe("NotificationBanner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the provided message and buttons", () => {
    const onRetry = vi.fn();
    const onDismiss = vi.fn();

    render(
      <NotificationBanner
        message="Network error"
        variant="error"
        onRetry={onRetry}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent("Network error");

    fireEvent.click(screen.getByText("Retry"));
    fireEvent.click(screen.getByText("Dismiss"));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("auto dismisses after the provided duration", () => {
    const onDismiss = vi.fn();

    render(
      <NotificationBanner
        message="Working offline"
        variant="offline"
        onDismiss={onDismiss}
        autoDismissMs={1500}
      />
    );

    expect(screen.getByRole("status")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
      vi.runAllTimers();
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

describe("NotificationBanner - Snapshots", () => {
  it("matches snapshot for error variant", () => {
    const { container } = render(
      <NotificationBanner message="Something failed" variant="error" />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("matches snapshot for offline variant with retry button", () => {
    const { container } = render(
      <NotificationBanner
        message="You are offline"
        variant="offline"
        onRetry={vi.fn()}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
