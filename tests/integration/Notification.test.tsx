import { render, screen, act, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@/stores/useAppStore";
import Notification from "@/components/Notification";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function renderNotification() {
  return render(<Notification />);
}

function setNotification(message: string, type: "success" | "error" | "info") {
  useAppStore.setState({ notification: { message, type } });
}

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
  useAppStore.setState({ notification: null });
});

afterEach(() => {
  // Explicit cleanup before restoring timers so React Testing Library's
  // internal teardown doesn't try to schedule work with real timers while
  // fake timers are still active. Without this, stale renders accumulate
  // across tests and cause "Found multiple elements" errors.
  cleanup();
  vi.runAllTimers();
  vi.useRealTimers();
});

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("Notification — Integration", () => {

  describe("conditional rendering", () => {
    it("renders nothing when notification is null", () => {
      renderNotification();

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("renders the notification message when notification is set", () => {
      setNotification("Added to favorites", "success");

      renderNotification();

      expect(screen.getByText("Added to favorites")).toBeInTheDocument();
    });
  });

  describe("ARIA roles by type", () => {
    it("uses role=status for success notifications (polite live region)", () => {
      setNotification("Added to favorites", "success");

      renderNotification();

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("uses role=status for info notifications (polite live region)", () => {
      setNotification("Your list is empty", "info");

      renderNotification();

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("uses role=alert for error notifications (assertive live region)", () => {
      setNotification("Something went wrong", "error");

      renderNotification();

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("error notification has aria-live=assertive", () => {
      setNotification("Error occurred", "error");

      renderNotification();

      expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
    });

    it("success notification has aria-live=polite", () => {
      setNotification("Saved!", "success");

      renderNotification();

      expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    });

    it("notification container has aria-atomic=true", () => {
      setNotification("Test", "info");

      renderNotification();

      expect(screen.getByRole("status")).toHaveAttribute("aria-atomic", "true");
    });
  });

  describe("manual close", () => {
    it("close button is present with an accessible label", () => {
      setNotification("Test message", "success");

      renderNotification();

      expect(
        screen.getByRole("button", { name: /close notification/i }),
      ).toBeInTheDocument();
    });

    it("clicking the close button sets notification to null in the store", () => {
      setNotification("Removed from favorites", "info");

      renderNotification();

      // fireEvent is synchronous — no fake-timer conflicts.
      // clearNotification() is also synchronous so the store updates immediately.
      fireEvent.click(
        screen.getByRole("button", { name: /close notification/i }),
      );

      expect(useAppStore.getState().notification).toBeNull();
    });
  });

  describe("auto-dismiss", () => {
    it("success notification auto-dismisses after 4000ms", () => {
      setNotification("Added to favorites", "success");

      renderNotification();

      expect(screen.getByText("Added to favorites")).toBeInTheDocument();

      act(() => { vi.advanceTimersByTime(4000); });

      // Read store directly — waitFor's setInterval never ticks with fake timers.
      expect(useAppStore.getState().notification).toBeNull();
    });

    it("success notification does not dismiss before 4000ms", () => {
      setNotification("Saved!", "success");

      renderNotification();

      act(() => { vi.advanceTimersByTime(3999); });

      expect(useAppStore.getState().notification).not.toBeNull();
    });

    it("info notification auto-dismisses after 6000ms", () => {
      setNotification("Your list is empty", "info");

      renderNotification();

      act(() => { vi.advanceTimersByTime(5999); });
      expect(useAppStore.getState().notification).not.toBeNull();

      act(() => { vi.advanceTimersByTime(1); });
      expect(useAppStore.getState().notification).toBeNull();
    });

    it("error notification does NOT auto-dismiss", () => {
      setNotification("Something failed", "error");

      renderNotification();

      act(() => { vi.advanceTimersByTime(10_000); });

      expect(useAppStore.getState().notification).not.toBeNull();
    });
  });
});
