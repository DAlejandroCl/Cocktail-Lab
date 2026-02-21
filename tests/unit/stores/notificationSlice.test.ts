import { describe, it, expect, beforeEach } from "vitest";
import { createStore } from "zustand/vanilla";
import { createNotificationSlice } from "@/stores/notificationSlice";
import type { NotificationSliceType } from "@/stores/notificationSlice";

/* -------------------------------------------------- */
/*                 Test Store Factory                 */
/* -------------------------------------------------- */

const createTestStore = () =>
  createStore<NotificationSliceType>(createNotificationSlice);

/* -------------------------------------------------- */
/*                      Tests                         */
/* -------------------------------------------------- */

describe("notificationSlice", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it("has null as initial state", () => {
    expect(store.getState().notification).toBeNull();
  });

  it("sets a success notification", () => {
    store.getState().setNotification("Saved successfully", "success");

    expect(store.getState().notification).toEqual({
      message: "Saved successfully",
      type: "success",
    });
  });

  it("sets an error notification", () => {
    store.getState().setNotification("Something went wrong", "error");

    expect(store.getState().notification).toEqual({
      message: "Something went wrong",
      type: "error",
    });
  });

  it("sets an info notification", () => {
    store.getState().setNotification("FYI message", "info");

    expect(store.getState().notification).toEqual({
      message: "FYI message",
      type: "info",
    });
  });

  it("overwrites previous notification", () => {
    store.getState().setNotification("First", "info");
    store.getState().setNotification("Second", "success");

    expect(store.getState().notification).toEqual({
      message: "Second",
      type: "success",
    });
  });

  it("clears the notification", () => {
    store.getState().setNotification("Test", "info");
    store.getState().clearNotification();

    expect(store.getState().notification).toBeNull();
  });
});