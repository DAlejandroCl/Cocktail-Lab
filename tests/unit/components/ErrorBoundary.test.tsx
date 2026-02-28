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
    // Silence the expected React error output so test output stays clean
    vi.spyOn(console, "error").mockImplementation(() => {});
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

    expect(screen.getByText("Something went wrong")).toHaveFocus();
  });

  it("calls window.location.reload when the Reload Page button is clicked", () => {
    const reloadMock = vi.fn();
    const originalLocation = window.location;

    // jsdom does not implement window.location.reload.
    // vi.spyOn(window.location, "reload") fails because the property is
    // non-configurable in jsdom. Object.defineProperty is the correct approach.
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

    // Restore original location so other tests are not affected
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
