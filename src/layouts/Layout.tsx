import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import Header from "../components/Header";
import Modal from "../components/Modal";
import Notification from "../components/Notification";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Suspense fallback={null}>
        <main className="flex-1">
          <Outlet />
        </main>
      </Suspense>
      <Modal />
      <Notification />
    </div>
  );
}
