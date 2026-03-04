import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import Header from "../components/Header";
import Modal from "../components/Modal";
import Notification from "../components/Notification";
import ErrorBoundary from "../components/ErrorBoundary";

export default function Layout() {
  const handleSkipLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.getElementById("main-content");
    if (main) {
      main.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link" onClick={handleSkipLink}>
        Skip to main content
      </a>
      <Header />
      <Suspense fallback={null}>
        <ErrorBoundary>
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 focus:outline-none"
          >
            <Outlet />
          </main>
        </ErrorBoundary>
      </Suspense>
      <Modal />
      <Notification />
    </div>
  );
}
