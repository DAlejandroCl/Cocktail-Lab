import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import ErrorBoundary from "@/components/ErrorBoundary";

// ─────────────────────────────────────────────
// Helper component that throws
// ─────────────────────────────────────────────

const ProblemChild: React.FC = () => {
  throw new Error("Test error");
};

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("ErrorBoundary — Accessibility", () => {

  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div>Safe content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Safe content")).toBeInTheDocument();
  });

  it("renders fallback UI with role=alert when an error occurs", async () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("has no accessibility violations in the fallback UI", async () => {
    const { container } = render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );

    await waitFor(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  it("fallback container uses aria-labelledby pointing to the error title", async () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveAttribute("aria-labelledby", "error-title");

    expect(
      screen.getByRole("heading", { name: /something went wrong/i }),
    ).toBeInTheDocument();
  });

  it("moves focus to the error heading on mount", async () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );

    const heading = await screen.findByRole("heading", {
      name: /something went wrong/i,
    });

    await waitFor(() => {
      expect(heading).toHaveFocus();
    });
  });

  it("error heading has tabIndex=-1 for programmatic focus", async () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );

    expect(
      await screen.findByRole("heading", { name: /something went wrong/i }),
    ).toHaveAttribute("tabindex", "-1");
  });

  it("renders an accessible Reload Page button", async () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );

    expect(
      await screen.findByRole("button", { name: /reload page/i }),
    ).toBeInTheDocument();
  });

  it("calls window.location.reload when the Reload button is clicked", async () => {
    const user = userEvent.setup();

    const reloadMock = vi.fn();
    const originalLocation = window.location;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, reload: reloadMock },
    });

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );

    await user.click(
      await screen.findByRole("button", { name: /reload page/i }),
    );

    expect(reloadMock).toHaveBeenCalledOnce();

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("renders a custom fallback if the fallback prop is provided", async () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ProblemChild />
      </ErrorBoundary>,
    );

    expect(await screen.findByText("Custom fallback")).toBeInTheDocument();
  });

  it("does not trap focus — Tab moves past the Reload button", async () => {
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );

    const button = await screen.findByRole("button", { name: /reload page/i });

    await user.tab();
    expect(button).toHaveFocus();

    await user.tab();
    expect(document.body).not.toHaveFocus();
  });
});
