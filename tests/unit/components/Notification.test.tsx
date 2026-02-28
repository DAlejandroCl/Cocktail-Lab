import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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

  // afterEach was previously missing from the vitest import
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
    // userEvent requires real timers; switch back for this interaction test
    vi.useRealTimers();
    const user = userEvent.setup();

    useAppStore.setState({
      notification: { type: "info", message: "Information message" },
    });

    render(<Notification />);

    await user.click(
      screen.getByRole("button", { name: /close notification/i }),
    );

    expect(useAppStore.getState().notification).toBeNull();
  });

  // ── Auto-dismiss ──────────────────────────────────────────────────────

  it("auto-dismisses a success notification after 4000ms", () => {
    useAppStore.setState({
      notification: { type: "success", message: "Auto dismiss test" },
    });

    render(<Notification />);

    vi.advanceTimersByTime(4000);

    expect(useAppStore.getState().notification).toBeNull();
  });

  it("does not auto-dismiss error notifications", () => {
    useAppStore.setState({
      notification: { type: "error", message: "Error stays" },
    });

    render(<Notification />);

    vi.advanceTimersByTime(10_000);

    expect(useAppStore.getState().notification).not.toBeNull();
  });

  // ── Hover pause ───────────────────────────────────────────────────────

  it("pauses the auto-dismiss timer on hover", async () => {
    // advanceTimers must be passed so userEvent can tick fake timers internally
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    });

    useAppStore.setState({
      notification: { type: "success", message: "Hover test" },
    });

    render(<Notification />);

    await user.hover(screen.getByRole("status"));

    vi.advanceTimersByTime(4000);

    expect(useAppStore.getState().notification).not.toBeNull();
  });
});
