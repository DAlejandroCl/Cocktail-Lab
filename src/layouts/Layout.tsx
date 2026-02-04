import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Modal from "../components/Modal";

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Header />
      <Outlet />
      <Modal />
    </div>
  );
}
