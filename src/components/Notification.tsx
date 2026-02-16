import { Fragment, useEffect } from "react";
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

export default function Notification() {
  const notification = useAppStore(selectNotification);
  const clearNotification = useAppStore(selectClearNotification);

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      clearNotification();
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification, clearNotification]);

  if (!notification || !notification.message) return null;

  const isError = notification.type === "error";

  return (
    <div className="pointer-events-none fixed inset-0 z-9999 flex items-start justify-end p-6">
      <Transition
        show={!!notification}
        as={Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-4 opacity-0 scale-95"
        enterTo="translate-y-0 opacity-100 scale-100"
        leave="transition ease-in duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div
          role={isError ? "alert" : "status"}
          aria-live={isError ? "assertive" : "polite"}
          aria-atomic="true"
          className="pointer-events-auto w-full max-w-sm rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl relative overflow-hidden"
          style={{
            background: "rgba(15, 23, 42, 0.85)",
          }}
        >
          <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/30 shadow-lg shadow-primary/20 pointer-events-none" />

          <div className="p-5 flex items-start gap-4 relative">
            <div className="shrink-0" aria-hidden="true">
              {notification.type === "success" && (
                <CheckCircleIcon className="w-6 h-6 text-green-400" />
              )}
              {notification.type === "error" && (
                <XCircleIcon className="w-6 h-6 text-red-400" />
              )}
              {notification.type === "info" && (
                <InformationCircleIcon className="w-6 h-6 text-primary" />
              )}
            </div>

            <div className="flex-1">
              <p className="text-white text-sm font-semibold tracking-wide">
                {notification.message}
              </p>
            </div>

            <button
              onClick={clearNotification}
              aria-label="Close notification"
              className="text-white/40 hover:text-white transition-colors focus-visible:outline-none"
            >
              <XMarkIcon className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </Transition>
    </div>
  );
}
