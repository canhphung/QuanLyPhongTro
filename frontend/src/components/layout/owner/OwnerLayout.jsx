import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "../Header";

export default function OwnerLayout() {
  return (
      <div className="flex min-h-screen flex-col bg-gray-100 md:flex-row">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header />

          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
  );
}