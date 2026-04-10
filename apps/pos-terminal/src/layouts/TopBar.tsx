import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { useAuthStore } from "../store/authStore";
import type { User } from "../types";

interface TopBarProps {
  user: User | null;
}

export default function TopBar({ user }: TopBarProps) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "POS";

  const handleSignOut = async () => {
    await apiService.logout();
    logout();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-sm font-semibold text-white">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">
            {user?.name ?? "Point of Sale"}
          </p>
          <p className="text-xs text-slate-300">{user?.role ?? "cashier"}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        className="rounded-md border border-slate-700 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
      >
        Sign out
      </button>
    </header>
  );
}
