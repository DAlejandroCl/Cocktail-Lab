import { Fragment, useEffect, useRef } from "react";
import { Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useAppStore } from "../stores/useAppStore";
import {
  selectNotification,
  selectClearNotification,
} from "../stores/selectors";

/* ─────────────────────────────────────────────────────────────
   NOTIFICATION TOAST COMPONENT
───────────────────────────────────────────────────────────── */

export default function Notification() {
  const notification = useAppStore(selectNotification);
  const clearNotification = useAppStore(selectClearNotification);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isError = notification?.type === "error";

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stopTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const getDuration = (type?: string): number | null => {
    if (type === "success") return 4000;
    if (type === "info") return 5000;
    return null;
  };

  useEffect(() => {
    if (!notification) return;
    const duration = getDuration(notification.type);
    if (!duration) return;
    stopTimer();
    timerRef.current = setTimeout(clearNotification, duration);
    return stopTimer;
  }, [notification, clearNotification]);

  const restartTimer = () => {
    if (!notification || isError) return;
    const duration = getDuration(notification.type);
    if (duration) {
      timerRef.current = setTimeout(clearNotification, duration);
    }
  };

  if (!notification?.message) return null;

  const iconMap = {
    success: (
      <CheckCircleIcon
        className="w-5 h-5"
        style={{ color: "#4ade80" }}
        aria-hidden="true"
      />
    ),
    error: (
      <XCircleIcon
        className="w-5 h-5"
        style={{ color: "#f87171" }}
        aria-hidden="true"
      />
    ),
    info: (
      <InformationCircleIcon
        className="w-5 h-5"
        style={{ color: "var(--color-brand)" }}
        aria-hidden="true"
      />
    ),
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-9999 flex items-start justify-end p-4 sm:p-6">
      <Transition
        show={!!notification}
        as={Fragment}
        enter={
          prefersReducedMotion
            ? ""
            : "transform ease-out duration-300 transition"
        }
        enterFrom={
          prefersReducedMotion ? "" : "translate-y-3 opacity-0 scale-95"
        }
        enterTo={prefersReducedMotion ? "" : "translate-y-0 opacity-100 scale-100"}
        leave={prefersReducedMotion ? "" : "transition ease-in duration-200"}
        leaveFrom={prefersReducedMotion ? "" : "opacity-100 scale-100"}
        leaveTo={prefersReducedMotion ? "" : "opacity-0 scale-90"}
      >
        <div
          role={isError ? "alert" : "status"}
          aria-live={isError ? "assertive" : "polite"}
          aria-atomic="true"
          onMouseEnter={stopTimer}
          onMouseLeave={restartTimer}
          onFocus={stopTimer}
          onBlur={restartTimer}
          className="pointer-events-auto w-full max-w-sm rounded-2xl overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.18), 0 0 0 1px rgba(242, 127, 13, 0.15)",
          }}
        >
          <div className="flex items-start gap-3 p-4">
            <div className="shrink-0 mt-0.5">
              {iconMap[notification.type as keyof typeof iconMap] ??
                iconMap.info}
            </div>

            <p
              id="notification-message"
              className="flex-1 text-sm font-semibold leading-relaxed"
              style={{ color: "var(--text-primary)" }}
            >
              {notification.message}
            </p>

            <button
              onClick={() => {
                stopTimer();
                clearNotification();
              }}
              aria-label="Dismiss notification"
              aria-describedby="notification-message"
              className="shrink-0 rounded-lg p-0.5 transition-colors duration-200"
              style={{ color: "var(--text-muted)" }}
            >
              <XMarkIcon className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div
            aria-hidden="true"
            style={{
              height: "2px",
              background: `linear-gradient(to right, var(--color-brand), transparent)`,
            }}
          />
        </div>
      </Transition>
    </div>
  );
}
