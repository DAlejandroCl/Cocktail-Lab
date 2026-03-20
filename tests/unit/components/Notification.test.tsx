import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Notification from "@/components/Notification";
import { useAppStore } from "@/stores/useAppStore";

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────

describe("Notification Component", () => {
  beforeEach(() => {
    useAppStore.setState({ notification: null });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Render conditions ─────────────────────────────────────────────────

  it("does not render when there is no notification", () => {
    render(<Notification />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders a success notification with role=status", () => {
    useAppStore.setState({
      notification: { type: "success", message: "Saved successfully" },
    });

    render(<Notification />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Saved successfully")).toBeVisible();
  });

  it("renders an error notification with role=alert", () => {
    useAppStore.setState({
      notification: { type: "error", message: "Something went wrong" },
    });

    render(<Notification />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeVisible();
  });

  // ── Close button ──────────────────────────────────────────────────────

  it("clears the notification when the close button is clicked", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();

    useAppStore.setState({
      notification: { type: "info", message: "Information message" },
    });

    render(<Notification />);

    // aria-label in Notification.tsx is "Dismiss notification"
    await user.click(
      screen.getByRole("button", { name: /dismiss notification/i }),
    );

    expect(useAppStore.getState().notification).toBeNull();
  });

  // ── Auto-dismiss ──────────────────────────────────────────────────────

  it("auto-dismisses a success notification after 4000ms", () => {
    useAppStore.setState({
      notification: { type: "success", message: "Auto dismiss test" },
    });

    render(<Notification />);

    // act must come from @testing-library/react, not vitest
    act(() => { vi.advanceTimersByTime(4000); });

    expect(useAppStore.getState().notification).toBeNull();
  });

  it("does not auto-dismiss error notifications", () => {
    useAppStore.setState({
      notification: { type: "error", message: "Error stays" },
    });

    render(<Notification />);

    act(() => { vi.advanceTimersByTime(10_000); });

    expect(useAppStore.getState().notification).not.toBeNull();
  });

  // ── Hover pause ───────────────────────────────────────────────────────

  it("pauses the auto-dismiss timer on hover", () => {
    useAppStore.setState({
      notification: { type: "success", message: "Hover test" },
    });

    render(<Notification />);

    // fireEvent is synchronous — no fake-timer conflicts unlike
    // userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
    // which evaluates the binding during Vitest's collect phase (before
    // vi.useFakeTimers() runs) and causes a STACK_TRACE_ERROR.
    act(() => { fireEvent.mouseEnter(screen.getByRole("status")); });
    act(() => { vi.advanceTimersByTime(4000); });

    expect(useAppStore.getState().notification).not.toBeNull();
  });
});
