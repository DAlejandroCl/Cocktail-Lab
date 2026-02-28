import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import Notification from "@/components/Notification";
import { useAppStore } from "@/stores/useAppStore";

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────

beforeEach(() => {
  useAppStore.setState({ notification: null });
});

afterEach(() => {
  vi.useRealTimers();
});

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────

function renderNotification() {
  return render(<Notification />);
}

function setNotification(message: string, type: "success" | "error" | "info") {
  useAppStore.setState({ notification: { message, type } });
}

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("Notification — Accessibility", () => {

  it("has no accessibility violations for a success notification", async () => {
    setNotification("Added to favorites", "success");

    const { container } = renderNotification();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations for an error notification", async () => {
    setNotification("Something failed", "error");

    const { container } = renderNotification();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("uses role=status for success notifications (polite live region)", () => {
    setNotification("Saved correctly", "success");

    renderNotification();

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses role=status for info notifications (polite live region)", () => {
    setNotification("Your list is empty", "info");

    renderNotification();

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses role=alert for error notifications (assertive live region)", () => {
    setNotification("Something failed", "error");

    renderNotification();

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("success notification has aria-live=polite and aria-atomic=true", () => {
    setNotification("Saved!", "success");

    renderNotification();

    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveAttribute("aria-atomic", "true");
  });

  it("error notification has aria-live=assertive", () => {
    setNotification("Error occurred", "error");

    renderNotification();

    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
  });

  it("has an accessible close button", () => {
    setNotification("Closable message", "success");

    renderNotification();

    expect(
      screen.getByRole("button", { name: /close notification/i }),
    ).toBeInTheDocument();
  });

  it("clicking the close button clears the notification", async () => {
    const user = userEvent.setup();

    setNotification("Closable message", "success");

    renderNotification();

    await user.click(
      screen.getByRole("button", { name: /close notification/i }),
    );

    await waitFor(() => {
      expect(useAppStore.getState().notification).toBeNull();
    });
  });

  it("auto-dismisses success notification after 4000ms", async () => {
    vi.useFakeTimers();

    setNotification("Added to favorites", "success");

    renderNotification();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    await waitFor(() => {
      expect(useAppStore.getState().notification).toBeNull();
    });

    vi.useRealTimers();
  });

  it("success notification is still present at 3999ms", () => {
    vi.useFakeTimers();

    setNotification("Saved!", "success");

    renderNotification();

    act(() => {
      vi.advanceTimersByTime(3999);
    });

    expect(useAppStore.getState().notification).not.toBeNull();

    vi.useRealTimers();
  });

  it("auto-dismisses info notification after 6000ms", async () => {
    vi.useFakeTimers();

    setNotification("Your list is empty", "info");

    renderNotification();

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    await waitFor(() => {
      expect(useAppStore.getState().notification).toBeNull();
    });

    vi.useRealTimers();
  });

  it("error notification does NOT auto-dismiss", () => {
    vi.useFakeTimers();

    setNotification("Persistent error", "error");

    renderNotification();

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(useAppStore.getState().notification).not.toBeNull();

    vi.useRealTimers();
  });

  it("pauses the auto-dismiss timer on mouse enter", async () => {
    vi.useFakeTimers();

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });

    setNotification("Hover pause", "success");

    renderNotification();

    const region = screen.getByRole("status");

    await user.hover(region);

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(useAppStore.getState().notification).not.toBeNull();

    vi.useRealTimers();
  });

  it("pauses the auto-dismiss timer on focus", async () => {
    vi.useFakeTimers();

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });

    setNotification("Focus pause", "success");

    renderNotification();

    await user.tab();

    expect(
      screen.getByRole("button", { name: /close notification/i }),
    ).toHaveFocus();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(useAppStore.getState().notification).not.toBeNull();

    vi.useRealTimers();
  });

  it("renders nothing when notification is null", () => {
    renderNotification();

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders nothing when the message is an empty string", () => {
    useAppStore.setState({ notification: { message: "", type: "success" } });

    renderNotification();

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
