import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

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
        <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
          <div
            className="relative w-full max-w-lg"
            role="alert"
            aria-labelledby="error-title"
          >
            <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-primary/30 via-purple-500/20 to-primary/30 blur-2xl opacity-40" />

            <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 text-center shadow-2xl">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
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
                className="text-3xl font-bold text-white mb-4 tracking-tight focus:outline-none"
              >
                Something went wrong
              </h2>

              <p className="text-white/60 mb-8 leading-relaxed">
                An unexpected error occurred while rendering this section.
                Please try reloading the page.
              </p>

              <button
                onClick={this.handleReload}
                className="button-primary px-10 h-14 bg-primary text-navy-deep font-bold rounded-xl shadow-lg shadow-primary/20 cursor-pointer hover:scale-[1.02] transition-transform focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
