import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ErrorBoundary from "@/components/ErrorBoundary";

/* ---------- Helper Component ---------- */

const ThrowError: React.FC = () => {
  throw new Error("Test error");
};

/* ---------- Tests ---------- */

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div>Safe Content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Safe Content")).toBeInTheDocument();
  });

  it("renders fallback UI when error occurs and fallback is provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom Fallback</div>}>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Custom Fallback")).toBeInTheDocument();
  });

  it("renders default error UI when error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();

    expect(
      screen.getByText("Something went wrong"),
    ).toBeInTheDocument();
  });

  it("focuses the error title when error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    const heading = screen.getByText("Something went wrong");

    expect(heading).toHaveFocus();
  });

  it("calls window.location.reload when clicking Reload Page", () => {
    const reloadSpy = vi
      .spyOn(window.location, "reload")
      .mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /reload page/i }),
    );

    expect(reloadSpy).toHaveBeenCalled();
  });

  it("logs error to console when error is caught", () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(consoleSpy).toHaveBeenCalled();
  });
});