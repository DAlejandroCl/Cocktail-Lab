import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "@/components/ErrorBoundary";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function BrokenComponent(): never {
  throw new Error("Test render error");
}

function renderWithBoundary(children: React.ReactNode) {
  return render(<ErrorBoundary>{children}</ErrorBoundary>);
}

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────

beforeEach(() => {
  // Silence React's console.error output for expected boundary errors
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("ErrorBoundary — Integration", () => {

  describe("no error", () => {
    it("renders children when no error is thrown", () => {
      renderWithBoundary(<p>Everything is fine</p>);

      expect(screen.getByText("Everything is fine")).toBeInTheDocument();
    });

    it("does not render the fallback UI when no error is thrown", () => {
      renderWithBoundary(<p>All good</p>);

      expect(
        screen.queryByRole("heading", { name: /something went wrong/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("with error", () => {
    it("renders the default fallback heading when a child throws", () => {
      renderWithBoundary(<BrokenComponent />);

      expect(
        screen.getByRole("heading", { name: /something went wrong/i }),
      ).toBeInTheDocument();
    });

    it("renders the Reload Page button in the default fallback", () => {
      renderWithBoundary(<BrokenComponent />);

      expect(
        screen.getByRole("button", { name: /reload page/i }),
      ).toBeInTheDocument();
    });

    it("renders a custom fallback when the fallback prop is provided", () => {
      render(
        <ErrorBoundary fallback={<p>Custom error UI</p>}>
          <BrokenComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Custom error UI")).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /something went wrong/i }),
      ).not.toBeInTheDocument();
    });

    it("does not render children after an error is caught", () => {
      renderWithBoundary(<BrokenComponent />);

      expect(screen.queryByText("Everything is fine")).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("the error container has role=alert", () => {
      renderWithBoundary(<BrokenComponent />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("the error container is labelled by the error heading", () => {
      renderWithBoundary(<BrokenComponent />);

      expect(screen.getByRole("alert")).toHaveAttribute(
        "aria-labelledby",
        "error-title",
      );
    });

    it("the error heading has tabIndex=-1 for programmatic focus", () => {
      renderWithBoundary(<BrokenComponent />);

      expect(
        screen.getByRole("heading", { name: /something went wrong/i }),
      ).toHaveAttribute("tabindex", "-1");
    });

    it("calls window.location.reload when the Reload button is clicked", async () => {
      const user = userEvent.setup();

      const reloadMock = vi.fn();
      const originalLocation = window.location;

      Object.defineProperty(window, "location", {
        configurable: true,
        value: { ...originalLocation, reload: reloadMock },
      });

      renderWithBoundary(<BrokenComponent />);

      await user.click(screen.getByRole("button", { name: /reload page/i }));

      expect(reloadMock).toHaveBeenCalledOnce();

      Object.defineProperty(window, "location", {
        configurable: true,
        value: originalLocation,
      });
    });
  });
});
