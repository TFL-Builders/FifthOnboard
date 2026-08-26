import { Outlet } from "react-router-dom";
import { Sidebar } from "../Components/Sidebar";

const Layout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
