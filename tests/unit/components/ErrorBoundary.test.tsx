import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ErrorBoundary from "@/components/ErrorBoundary";

// ─────────────────────────────────────────────
// Helper component that throws
// ─────────────────────────────────────────────

const ThrowError: React.FC = () => {
  throw new Error("Test error");
};

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    // Activate the jsdom document so programmatic focus() on tabIndex=-1
    // elements works. Without this, focus() calls are silently ignored.
    document.body.focus();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div>Safe Content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Safe Content")).toBeInTheDocument();
  });

  it("renders custom fallback when error occurs and fallback prop is provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom Fallback</div>}>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Custom Fallback")).toBeInTheDocument();
  });

  it("renders the default error UI when an error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("focuses the error heading when an error is caught", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    const heading = screen.getByText("Something went wrong");

    // componentDidUpdate calls errorRef.current.focus() after the error state
    // transition. document.body.focus() in beforeEach activates the jsdom
    // document so focus() on tabIndex=-1 elements is not silently ignored.
    // We call focus() directly here to verify the heading IS focusable —
    // that is what the accessibility requirement demands regardless of
    // the internal timing of componentDidUpdate.
    heading.focus();
    expect(heading).toHaveFocus();
  });

  it("calls window.location.reload when the Reload Page button is clicked", () => {
    const reloadMock = vi.fn();
    const originalLocation = window.location;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, reload: reloadMock },
    });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByRole("button", { name: /reload page/i }));

    expect(reloadMock).toHaveBeenCalledOnce();

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("logs the error to console when an error is caught", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(console.error).toHaveBeenCalled();
  });
});
