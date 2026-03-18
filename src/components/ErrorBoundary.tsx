import React from "react";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/* ─────────────────────────────────────────────────────────────
   ERROR BOUNDARY
───────────────────────────────────────────────────────────── */

export default class ErrorBoundary extends React.Component<Props, State> {
  private errorRef = React.createRef<HTMLHeadingElement>();

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  componentDidUpdate(_: Props, prevState: State) {
    if (!prevState.hasError && this.state.hasError) {
      this.errorRef.current?.focus();
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-[70vh] flex items-center justify-center px-6 py-16"
          style={{ background: "var(--bg-base)" }}
        >
          <div
            className="w-full max-w-md text-center"
            role="alert"
            aria-labelledby="error-title"
          >
            <div className="flex justify-center mb-7">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(248, 113, 113, 0.1)",
                  border: "1px solid rgba(248, 113, 113, 0.25)",
                }}
              >
                <svg
                  className="w-7 h-7"
                  style={{ color: "#f87171" }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                  />
                </svg>
              </div>
            </div>

            <h2
              id="error-title"
              ref={this.errorRef}
              tabIndex={-1}
              className="text-2xl font-serif font-bold mb-3 focus:outline-none"
              style={{ color: "var(--text-primary)" }}
            >
              Something went wrong
            </h2>

            <p
              className="text-sm leading-relaxed mb-8 max-w-sm mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              An unexpected error occurred while rendering this section. Please
              try reloading the page.
            </p>

            <button
              onClick={this.handleReload}
              className="btn-brand px-10 h-12 rounded-xl"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
