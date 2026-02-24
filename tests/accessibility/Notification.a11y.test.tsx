import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import userEvent from "@testing-library/user-event";
import Notification from "@/components/Notification";
import { useAppStore } from "@/stores/useAppStore";

expect.extend(toHaveNoViolations);

/* -------------------------------------------------- */
/*                Setup Store                         */
/* -------------------------------------------------- */

beforeEach(() => {
  useAppStore.setState({
    ...useAppStore.getState(),
    notification: null,
    clearNotification: vi.fn(() =>
      useAppStore.setState({ notification: null })
    ),
  });

  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

/* -------------------------------------------------- */
/*               Helper Renderer                      */
/* -------------------------------------------------- */

const renderNotification = () => render(<Notification />);

/* ================================================== */
/*              ACCESSIBILITY TESTS                   */
/* ================================================== */

describe("Notification Accessibility", () => {
  /* ---------------- Axe ---------------- */

  it("has no accessibility violations", async () => {
    useAppStore.setState({
      notification: {
        message: "Success message",
        type: "success",
      },
    });

    const { container } = renderNotification();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  /* ---------------- Roles ---------------- */

  it("uses role=status for success/info", () => {
    useAppStore.setState({
      notification: {
        message: "Saved correctly",
        type: "success",
      },
    });

    renderNotification();

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses role=alert for errors", () => {
    useAppStore.setState({
      notification: {
        message: "Something failed",
        type: "error",
      },
    });

    renderNotification();

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("sets correct aria-live value", () => {
    useAppStore.setState({
      notification: {
        message: "Info message",
        type: "info",
      },
    });

    renderNotification();

    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveAttribute("aria-atomic", "true");
  });

  /* ---------------- Close Button ---------------- */

  it("has accessible close button", () => {
    useAppStore.setState({
      notification: {
        message: "Closable",
        type: "success",
      },
    });

    renderNotification();

    const button = screen.getByRole("button", {
      name: /close notification/i,
    });

    expect(button).toBeInTheDocument();
  });

  it("clears notification when close button is clicked", async () => {
    const user = userEvent.setup();

    useAppStore.setState({
      notification: {
        message: "Closable",
        type: "success",
      },
    });

    renderNotification();

    const button = screen.getByRole("button", {
      name: /close notification/i,
    });

    await user.click(button);

    await waitFor(() => {
      expect(
        useAppStore.getState().notification
      ).toBeNull();
    });
  });

  /* ================================================== */
  /*              AUTO DISMISS BEHAVIOR                 */
  /* ================================================== */

  it("auto-dismisses success notification after 4s", async () => {
    useAppStore.setState({
      notification: {
        message: "Auto success",
        type: "success",
      },
    });

    renderNotification();

    vi.advanceTimersByTime(4000);

    await waitFor(() => {
      expect(
        useAppStore.getState().notification
      ).toBeNull();
    });
  });

  it("auto-dismisses info notification after 6s", async () => {
    useAppStore.setState({
      notification: {
        message: "Auto info",
        type: "info",
      },
    });

    renderNotification();

    vi.advanceTimersByTime(6000);

    await waitFor(() => {
      expect(
        useAppStore.getState().notification
      ).toBeNull();
    });
  });

  it("does NOT auto-dismiss error notifications", async () => {
    useAppStore.setState({
      notification: {
        message: "Persistent error",
        type: "error",
      },
    });

    renderNotification();

    vi.advanceTimersByTime(10000);

    expect(useAppStore.getState().notification).not.toBeNull();
  });

  /* ================================================== */
  /*                INTERACTION TESTS                   */
  /* ================================================== */

  it("pauses timer on hover", async () => {
    const user = userEvent.setup();

    useAppStore.setState({
      notification: {
        message: "Hover pause",
        type: "success",
      },
    });

    renderNotification();

    const region = screen.getByRole("status");

    await user.hover(region);

    vi.advanceTimersByTime(4000);

    expect(useAppStore.getState().notification).not.toBeNull();
  });

  it("pauses timer on focus", async () => {
    const user = userEvent.setup();

    useAppStore.setState({
      notification: {
        message: "Focus pause",
        type: "success",
      },
    });

    renderNotification();

    const closeButton = screen.getByRole("button", {
      name: /close notification/i,
    });

    await user.tab();

    expect(closeButton).toHaveFocus();

    vi.advanceTimersByTime(4000);

    expect(useAppStore.getState().notification).not.toBeNull();
  });

  /* ================================================== */
  /*            RENDER CONDITIONS                       */
  /* ================================================== */

  it("does not render if notification is null", () => {
    renderNotification();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("does not render if message is empty", () => {
    useAppStore.setState({
      notification: {
        message: "",
        type: "success",
      },
    });

    renderNotification();

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});