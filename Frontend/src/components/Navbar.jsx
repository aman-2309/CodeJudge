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
    <nav className="navbar fixed top-0 left-0 right-0 z-50 border-b border-[#3a3a3a] bg-[#1a1a1a]/95 px-4 backdrop-blur-md">
      {/* Brand */}
      <div className="flex-1">
        <NavLink
          to="/"
          className="btn btn-ghost gap-2 text-xl font-bold tracking-tight text-[#ffa116] hover:bg-[#262626] hover:text-[#ffb84d] rounded-md"
        >
          <Code2 size={20} />
          CodeJudge
        </NavLink>
      </div>

      {/* Right side */}
      <div className="flex-none flex items-center gap-3">
        {/* Home link (visible on non-home pages) */}
        {/* <NavLink
          to="/"
          className={({ isActive }) =>
            `btn btn-ghost btn-sm text-[#e0e0e0] hover:bg-[#262626] hover:text-[#ffa116] rounded-md ${
              isActive ? "text-[#ffa116]" : ""
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
              `btn btn-ghost btn-sm text-[#e0e0e0] hover:bg-[#262626] hover:text-[#ffa116] rounded-md ${
                isActive ? "text-[#ffa116]" : ""
              }`
            }
          >
            Admin
          </NavLink>
        )} */}

        {/* Profile avatar button */}
        <NavLink
          to="/profile"
          className="btn btn-circle btn-outline border-[#3a3a3a] bg-[#262626] text-[#e0e0e0] hover:border-[#ffa116] hover:bg-[#333333]"
          title={`${user?.firstName ?? "Profile"} — View profile`}
        >
          {(user?.firstName?.[0] ?? "U").toUpperCase()}
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;