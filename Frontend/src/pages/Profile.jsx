import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router";
import { logoutUser } from "../authSlice";
import axiosClient from "../utils/axiosClient";
import {
  LogOut,
  ShieldCheck,
  BarChart2,
  CheckCircle2,
  Code2,
  Trophy,
  Zap,
} from "lucide-react";

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: authUser } = useSelector((state) => state.auth);

  // Full profile data from backend
  const [profile, setProfile] = useState(null);
  // Total problem counts from allProblem
  const [totalCounts, setTotalCounts] = useState({ total: 0, Easy: 0, Medium: 0, Hard: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, allRes] = await Promise.all([
          axiosClient.get("/user/profile"),
          axiosClient.get("/problem/allProblem"),
        ]);

        setProfile(profileRes.data);

        const all = allRes.data || [];
        setTotalCounts({
          total: all.length,
          Easy: all.filter((p) => p.difficulty === "Easy").length,
          Medium: all.filter((p) => p.difficulty === "Medium").length,
          Hard: all.filter((p) => p.difficulty === "Hard").length,
        });
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  // Derived stats
  const solved = profile?.totalSolved ?? 0;
  const total = totalCounts.total;
  const percent = total > 0 ? Math.round((solved / total) * 100) : 0;

  const diffStats = [
    {
      label: "Easy",
      solved: profile?.solvedByDifficulty?.Easy ?? 0,
      total: totalCounts.Easy,
      color: "text-[#2cbb5d]",
      bar: "bg-[#2cbb5d]",
    },
    {
      label: "Medium",
      solved: profile?.solvedByDifficulty?.Medium ?? 0,
      total: totalCounts.Medium,
      color: "text-[#ffc01e]",
      bar: "bg-[#ffc01e]",
    },
    {
      label: "Hard",
      solved: profile?.solvedByDifficulty?.Hard ?? 0,
      total: totalCounts.Hard,
      color: "text-[#ff375f]",
      bar: "bg-[#ff375f]",
    },
  ];

  // Use profile data when loaded, fall back to Redux auth state
  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : `${authUser?.firstName ?? ""} ${authUser?.lastName ?? ""}`.trim();
  const displayEmail = profile?.email ?? authUser?.email ?? "";
  const displayRole = profile?.role ?? authUser?.role ?? "user";
  const displayInitial = (profile?.firstName ?? authUser?.firstName ?? "U")[0].toUpperCase();
  const displayUsername = profile?.userName ?? "";

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e0e0e0]">
      <div className="container mx-auto max-w-4xl px-4 py-10">
        {/* Error state */}
        {error && (
          <div className="alert alert-error mb-6 rounded-md">
            <span>{error}</span>
          </div>
        )}

        {/* Profile header card */}
        <div className="mb-8 flex flex-col items-center gap-6 rounded-lg border border-[#3a3a3a] bg-[#262626] p-8 sm:flex-row">
          {/* Avatar */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-[#ffa116]/60 bg-[#ffa116] text-4xl font-extrabold text-[#1a1a1a]">
            {displayInitial}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#e0e0e0]">
              {displayName || "User"}
            </h1>
            {displayUsername && (
              <p className="mt-0.5 text-sm text-[#8a8a8a]">@{displayUsername}</p>
            )}
            <p className="mt-1 text-[#8a8a8a]">{displayEmail}</p>
            {displayRole === "admin" && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-md border border-[#ffa116]/40 bg-[#ffa116]/10 px-3 py-0.5 text-xs font-semibold text-[#ffa116]">
                <ShieldCheck size={12} />
                Admin
              </span>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="btn btn-outline gap-2 rounded-md border-[#ff375f]/60 text-[#ff375f] hover:border-[#ff375f] hover:bg-[#ff375f]/10 hover:text-[#ff375f]"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Progress section */}
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#e0e0e0]">
            <BarChart2 size={20} className="text-[#ffa116]" />
            Progress
          </h2>

          {loading ? (
            <>
              {/* Overall ring + per-difficulty bars Skeleton */}
              <div className="mb-4 grid gap-4 rounded-lg border border-[#3a3a3a] bg-[#262626] p-6 sm:grid-cols-2">
                {/* Circular progress Skeleton */}
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="skeleton w-[9rem] h-[9rem] rounded-full bg-[#333333]"></div>
                  <div className="skeleton h-4 w-32 rounded bg-[#333333]"></div>
                </div>

                {/* Per-difficulty breakdown Skeleton */}
                <div className="flex flex-col justify-center gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="mb-1 flex justify-between text-sm">
                        <div className="skeleton h-4 w-12 rounded bg-[#333333]"></div>
                        <div className="skeleton h-4 w-12 rounded bg-[#333333]"></div>
                      </div>
                      <div className="skeleton h-2 w-full rounded-full mt-1 bg-[#333333]"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick stat cards Skeleton */}
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 rounded-lg border border-[#3a3a3a] bg-[#262626] p-4"
                  >
                    <div className="skeleton w-6 h-6 rounded-full mb-1 bg-[#333333]"></div>
                    <div className="skeleton h-8 w-12 rounded mb-1 bg-[#333333]"></div>
                    <div className="skeleton h-3 w-16 rounded bg-[#333333]"></div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Overall ring + per-difficulty bars */}
              <div className="mb-4 grid gap-4 rounded-lg border border-[#3a3a3a] bg-[#262626] p-6 sm:grid-cols-2">
                {/* Circular progress */}
                <div className="flex flex-col items-center justify-center gap-2">
                  <div
                    className="radial-progress text-[#ffa116]"
                    style={{ "--value": percent, "--size": "9rem", "--thickness": "8px" }}
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span className="text-2xl font-bold text-[#e0e0e0]">{percent}%</span>
                  </div>
                  <p className="text-sm text-[#8a8a8a]">
                    <span className="font-semibold text-[#ffa116]">{solved}</span> / {total} solved
                  </p>
                </div>

                {/* Per-difficulty breakdown */}
                <div className="flex flex-col justify-center gap-4">
                  {diffStats.map(({ label, solved: s, total: t, color, bar }) => (
                    <div key={label}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className={`font-semibold ${color}`}>{label}</span>
                        <span className="text-[#8a8a8a]">
                          {s} / {t}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#333333]">
                        <div
                          className={`h-2 rounded-full ${bar} transition-all duration-700`}
                          style={{ width: t > 0 ? `${(s / t) * 100}%` : "0%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick stat cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: <CheckCircle2 size={22} />, value: solved, label: "Solved", color: "text-[#2cbb5d]" },
                  { icon: <Trophy size={22} />, value: `${percent}%`, label: "Completion", color: "text-[#ffa116]" },
                  { icon: <Zap size={22} />, value: total - solved, label: "Remaining", color: "text-[#ff375f]" },
                ].map(({ icon, value, label, color }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1 rounded-lg border border-[#3a3a3a] bg-[#262626] p-4"
                  >
                    <span className={color}>{icon}</span>
                    <span className={`text-2xl font-extrabold ${color}`}>{value}</span>
                    <span className="text-xs text-[#8a8a8a]">{label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Action cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Problems link */}
          <NavLink
            to="/"
            className="group flex items-center gap-4 rounded-lg border border-[#3a3a3a] bg-[#262626] p-5 transition-colors duration-150 hover:border-[#ffa116]/40 hover:bg-[#2d2d2d]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#ffa116]/10 text-[#ffa116] group-hover:bg-[#ffa116]/20">
              <Code2 size={24} />
            </div>
            <div>
              <p className="font-bold text-[#e0e0e0] group-hover:text-[#ffa116]">Problem Set</p>
              <p className="text-sm text-[#8a8a8a]">Browse & solve problems</p>
            </div>
          </NavLink>

          {/* Admin panel — only for admins */}
          {displayRole === "admin" && (
            <NavLink
              to="/admin"
              className="group flex items-center gap-4 rounded-lg border border-[#3a3a3a] bg-[#262626] p-5 transition-colors duration-150 hover:border-[#ffa116]/40 hover:bg-[#2d2d2d]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#ffa116]/10 text-[#ffa116] group-hover:bg-[#ffa116]/20">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="font-bold text-[#e0e0e0] group-hover:text-[#ffa116]">Admin Panel</p>
                <p className="text-sm text-[#8a8a8a]">Manage problems & content</p>
              </div>
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;