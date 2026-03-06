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
    it("uses role=status for success notifications", () => {
      setNotification("Added to favorites", "success");
      renderNotification();
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("uses role=status for info notifications", () => {
      setNotification("Your list is empty", "info");
      renderNotification();
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("uses role=alert for error notifications", () => {
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

      act(() => { vi.advanceTimersByTime(4000); });

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

  describe("hover interaction", () => {
    it("mouseEnter pauses the auto-dismiss timer", () => {
      setNotification("Saved!", "success");
      renderNotification();

      act(() => { fireEvent.mouseEnter(screen.getByRole("status")); });
      act(() => { vi.advanceTimersByTime(4000); });

      expect(useAppStore.getState().notification).not.toBeNull();
    });

    it("mouseLeave restarts the timer for success notifications", () => {
      setNotification("Saved!", "success");
      renderNotification();

      act(() => { fireEvent.mouseEnter(screen.getByRole("status")); });
      act(() => { vi.advanceTimersByTime(4000); });
      expect(useAppStore.getState().notification).not.toBeNull();

      act(() => { fireEvent.mouseLeave(screen.getByRole("status")); });
      act(() => { vi.advanceTimersByTime(4000); });

      expect(useAppStore.getState().notification).toBeNull();
    });

    it("mouseLeave on error notification does NOT restart a timer", () => {
      setNotification("Something failed", "error");
      renderNotification();

      act(() => { fireEvent.mouseLeave(screen.getByRole("alert")); });
      act(() => { vi.advanceTimersByTime(10_000); });

      expect(useAppStore.getState().notification).not.toBeNull();
    });

    it("mouseLeave on info notification restarts the timer", () => {
      setNotification("Info message", "info");
      renderNotification();

      act(() => { fireEvent.mouseEnter(screen.getByRole("status")); });
      act(() => { vi.advanceTimersByTime(6000); });
      expect(useAppStore.getState().notification).not.toBeNull();

      act(() => { fireEvent.mouseLeave(screen.getByRole("status")); });
      act(() => { vi.advanceTimersByTime(6000); });

      expect(useAppStore.getState().notification).toBeNull();
    });
  });

  describe("focus interaction", () => {
    it("focus pauses the auto-dismiss timer", () => {
      setNotification("Saved!", "success");
      renderNotification();

      act(() => { fireEvent.focus(screen.getByRole("status")); });
      act(() => { vi.advanceTimersByTime(4000); });

      expect(useAppStore.getState().notification).not.toBeNull();
    });

    it("blur restarts the timer for non-error notifications", () => {
      setNotification("Saved!", "success");
      renderNotification();

      act(() => { fireEvent.focus(screen.getByRole("status")); });
      act(() => { vi.advanceTimersByTime(4000); });
      expect(useAppStore.getState().notification).not.toBeNull();

      act(() => { fireEvent.blur(screen.getByRole("status")); });
      act(() => { vi.advanceTimersByTime(4000); });

      expect(useAppStore.getState().notification).toBeNull();
    });

    it("blur on error notification does NOT restart a timer", () => {
      setNotification("Something failed", "error");
      renderNotification();

      act(() => { fireEvent.blur(screen.getByRole("alert")); });
      act(() => { vi.advanceTimersByTime(10_000); });

      expect(useAppStore.getState().notification).not.toBeNull();
    });
  });
});
