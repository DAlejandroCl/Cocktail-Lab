import type { StateCreator } from "zustand";

export type NotificationSliceType = {
  notification: {
    message: string;
    type: "success" | "error" | "info";
  } | null;
  setNotification: (message: string, type: "success" | "error" | "info") => void;
  clearNotification: () => void;
};

export const createNotificationSlice: StateCreator<NotificationSliceType> = (set) => ({
  notification: null,
  setNotification: (message, type) =>
    set(() => ({
      notification: { message, type },
    })),
  clearNotification: () =>
    set(() => ({
        notification: null,
    })),
});
