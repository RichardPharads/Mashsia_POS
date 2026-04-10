import { useState, type ReactElement } from "react";
import {
  MdAnalytics,
  MdDashboard,
  MdLogout,
  MdMenu,
  MdMenuOpen,
  MdPeople,
  MdSettings,
  MdShoppingCart,
} from "react-icons/md";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";

type MenuItem = {
  id: string;
  label: string;
  icon: ReactElement;
};

const MENU_ITEMS: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <MdDashboard size={18} /> },
  { id: "orders", label: "Orders", icon: <MdShoppingCart size={18} /> },
  { id: "reports", label: "Reports", icon: <MdAnalytics size={18} /> },
  { id: "staff", label: "Staff", icon: <MdPeople size={18} /> },
  { id: "settings", label: "Settings", icon: <MdSettings size={18} /> },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuthStore();

  return (
    <aside
      className={`flex h-full  ${collapsed ? "w-20" : "w-64"} flex-col border-r border-slate-800 bg-slate-900 text-slate-100`}
    >
      <header className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
        <div className="flex place-item-center">
          {!collapsed && (
            <div>
              <h1 className="text-lg font-semibold">Mashsia POS</h1>
              <p className="text-xs text-slate-400">Point of Sale</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setCollapsed((prev) => !prev);
            setShowUserMenu(false);
          }}
          className="rounded-md border border-slate-700 p-2 text-slate-200 hover:bg-slate-800"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <MdMenu size={18} /> : <MdMenuOpen size={18} />}
        </button>
      </header>

      <nav
        className={`flex-1 overflow-y-auto ${collapsed ? "px-2" : "px-4"} py-4`}
      >
        {!collapsed && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Navigation
          </p>
        )}
        <ul className="space-y-1">
          {MENU_ITEMS.map((item) => (
            <li key={item.id}>
              <Link to={`/${item.label.toLowerCase()}`}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white ${
                    collapsed ? "justify-center" : ""
                  }`}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <footer className="border-t border-slate-800 px-4 py-4">
        <button
          type="button"
          onClick={() => {
            if (!collapsed) {
              setShowUserMenu((open) => !open);
            }
          }}
          className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 truncate">
              <p className="truncate">{user?.name ?? "User account"}</p>
              <p className="truncate text-xs text-slate-400">
                {user?.email ?? "user@example.com"}
              </p>
            </div>
          )}
        </button>

        {!collapsed && showUserMenu && (
          <div className="mt-2 space-y-1 rounded-md border border-slate-800 bg-slate-900 p-2 text-sm">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2 rounded px-2 py-2 text-red-300 hover:bg-slate-800 hover:text-red-200"
            >
              <MdLogout size={16} />
              Sign out
            </button>
          </div>
        )}
      </footer>
    </aside>
  );
}
