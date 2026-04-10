import { Outlet } from "react-router-dom";
import { AppSidebar } from "../components/AppSidebar";

/**
 * MainLayout
 *
 * Renders a persistent application layout used across protected routes:
 * - left AppSidebar (navigation)
 * - top TopBar (user/status)
 * - main content area where route children are rendered via <Outlet />
 *
 * The layout keeps the sidebar visible while route changes only replace the
 * content inside the Outlet.
 */
export default function MainLayout(): any {
  return (
    <div className="h-lvh flex bg-slate-900 text-slate-100 ">
      {/* Sidebar (persistent) */}
      <AppSidebar />

      {/* Main content column */}
      <main className="flex-1 overflow-y-auto scroll-y-custom p-4">
        {/* Outlet will render the active route's element here */}
        <div className="max-w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
