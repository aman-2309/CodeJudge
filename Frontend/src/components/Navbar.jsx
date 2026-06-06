import { NavLink, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { Code2 } from "lucide-react";

// Pages where the navbar should NOT appear
const HIDDEN_ROUTES = ["/login", "/signup"];

function Navbar() {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Hide on auth pages or when not authenticated
  if (!isAuthenticated || HIDDEN_ROUTES.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-50 border-b border-slate-800/80 bg-slate-900/90 px-4 shadow-lg backdrop-blur-md">
      {/* Brand */}
      <div className="flex-1">
        <NavLink
          to="/"
          className="btn btn-ghost gap-2 text-xl font-bold tracking-tight text-amber-400 hover:bg-slate-800/70 hover:text-amber-300"
        >
          <Code2 size={20} />
          LeetCode
        </NavLink>
      </div>

      {/* Right side */}
      <div className="flex-none flex items-center gap-3">
        {/* Home link (visible on non-home pages) */}
        {/* <NavLink
          to="/"
          className={({ isActive }) =>
            `btn btn-ghost btn-sm text-slate-300 hover:bg-slate-800 hover:text-amber-400 ${
              isActive ? "text-amber-400" : ""
            }`
          }
        >
          Problems
        </NavLink> */}

        {/* Admin shortcut — only for admins */}
        {/* {user?.role === "admin" && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `btn btn-ghost btn-sm text-slate-300 hover:bg-slate-800 hover:text-amber-400 ${
                isActive ? "text-amber-400" : ""
              }`
            }
          >
            Admin
          </NavLink>
        )} */}

        {/* Profile avatar button */}
        <NavLink
          to="/profile"
          className="btn btn-circle btn-outline border-slate-700 bg-slate-800/90 text-slate-200 hover:border-amber-400 hover:bg-slate-700"
          title={`${user?.firstName ?? "Profile"} — View profile`}
        >
          {(user?.firstName?.[0] ?? "U").toUpperCase()}
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
