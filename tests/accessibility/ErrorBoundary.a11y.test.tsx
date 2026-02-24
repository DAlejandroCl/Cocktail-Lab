import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import userEvent from "@testing-library/user-event";
import ErrorBoundary from "@/components/ErrorBoundary";

expect.extend(toHaveNoViolations);

/* -------------------------------------------------- */
/*           Helper Component That Throws             */
/* -------------------------------------------------- */

const ProblemChild: React.FC = () => {
  throw new Error("Test error");
};

/* ================================================== */
/*                 ACCESSIBILITY TESTS                */
/* ================================================== */

describe("ErrorBoundary Accessibility", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /* -------------------------------------------------- */
  /*              Normal Render                         */
  /* -------------------------------------------------- */

  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div>Safe content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Safe content")).toBeInTheDocument();
  });

  /* -------------------------------------------------- */
  /*            Fallback Default UI                     */
  /* -------------------------------------------------- */

  it("renders fallback UI when error occurs", async () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    await waitFor(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  /* -------------------------------------------------- */
  /*           ARIA & SEMANTICS                         */
  /* -------------------------------------------------- */

  it("uses aria-labelledby correctly", async () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveAttribute("aria-labelledby", "error-title");

    const heading = screen.getByRole("heading", {
      name: /something went wrong/i,
    });

    expect(heading).toBeInTheDocument();
  });

  it("moves focus to error heading", async () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    const heading = await screen.findByRole("heading", {
      name: /something went wrong/i,
    });

    await waitFor(() => {
      expect(heading).toHaveFocus();
    });
  });

  /* -------------------------------------------------- */
  /*                Button Accessibility                */
  /* -------------------------------------------------- */

  it("renders accessible reload button", async () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    const button = await screen.findByRole("button", {
      name: /reload page/i,
    });

    expect(button).toBeInTheDocument();
  });

  it("calls window.location.reload when clicking reload", async () => {
    const reloadMock = vi
      .spyOn(window.location, "reload")
      .mockImplementation(() => {});

    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    const button = await screen.findByRole("button", {
      name: /reload page/i,
    });

    await user.click(button);

    expect(reloadMock).toHaveBeenCalled();
  });

  /* -------------------------------------------------- */
  /*              Custom Fallback                       */
  /* -------------------------------------------------- */

  it("renders custom fallback if provided", async () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(
      await screen.findByText("Custom fallback")
    ).toBeInTheDocument();
  });

  /* -------------------------------------------------- */
  /*              Keyboard Navigation                   */
  /* -------------------------------------------------- */

  it("does not trap focus", async () => {
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    const button = await screen.findByRole("button", {
      name: /reload page/i,
    });

    await user.tab();
    expect(button).toHaveFocus();

    await user.tab();
    expect(document.body).not.toHaveFocus();
  });
});