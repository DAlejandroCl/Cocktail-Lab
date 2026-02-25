import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Layout from "@/layouts/Layout";

/* -------------------------------------------------- */
/*                     Mocks                          */
/* -------------------------------------------------- */

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  };
});

vi.mock("@/components/Header", () => ({
  default: () => <header data-testid="header">Header</header>,
}));

vi.mock("@/components/Modal", () => ({
  default: () => <div data-testid="modal">Modal</div>,
}));

vi.mock("@/components/Notification", () => ({
  default: () => <div data-testid="notification">Notification</div>,
}));

vi.mock("@/components/ErrorBoundary", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

/* ================================================== */
/*                   UNIT TESTS                       */
/* ================================================== */

describe("Layout Component", () => {
  it("renders skip link", () => {
    render(<Layout />);

    const skipLink = screen.getByRole("link", {
      name: /skip to main content/i,
    });

    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("renders Header component", () => {
    render(<Layout />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("renders main element with correct attributes", () => {
    render(<Layout />);

    const main = screen.getByRole("main");

    expect(main).toHaveAttribute("id", "main-content");
    expect(main).toHaveAttribute("tabindex", "-1");
  });

  it("renders Outlet inside main", () => {
    render(<Layout />);
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });

  it("wraps main with ErrorBoundary", () => {
    render(<Layout />);
    expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
  });

  it("renders Modal component", () => {
    render(<Layout />);
    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  it("renders Notification component", () => {
    render(<Layout />);
    expect(screen.getByTestId("notification")).toBeInTheDocument();
  });
});