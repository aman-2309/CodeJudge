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
      color: "text-emerald-400",
      bar: "bg-emerald-500",
    },
    {
      label: "Medium",
      solved: profile?.solvedByDifficulty?.Medium ?? 0,
      total: totalCounts.Medium,
      color: "text-amber-400",
      bar: "bg-amber-500",
    },
    {
      label: "Hard",
      solved: profile?.solvedByDifficulty?.Hard ?? 0,
      total: totalCounts.Hard,
      color: "text-rose-400",
      bar: "bg-rose-500",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="container mx-auto max-w-4xl px-4 py-10">
        {/* Error state */}
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        {/* Profile header card */}
        <div className="mb-8 flex flex-col items-center gap-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl sm:flex-row">
          {/* Avatar */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-amber-400/60 bg-gradient-to-br from-amber-500 to-orange-600 text-4xl font-extrabold text-white shadow-lg">
            {displayInitial}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
              {displayName || "User"}
            </h1>
            {displayUsername && (
              <p className="mt-0.5 text-sm text-slate-500">@{displayUsername}</p>
            )}
            <p className="mt-1 text-slate-400">{displayEmail}</p>
            {displayRole === "admin" && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-0.5 text-xs font-semibold text-amber-400">
                <ShieldCheck size={12} />
                Admin
              </span>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="btn btn-outline btn-error gap-2 border-rose-700 text-rose-400 hover:border-rose-500 hover:bg-rose-950/50 hover:text-rose-300"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Progress section */}
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-200">
            <BarChart2 size={20} className="text-amber-400" />
            Progress
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-amber-400"></span>
            </div>
          ) : (
            <>
              {/* Overall ring + per-difficulty bars */}
              <div className="mb-4 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl sm:grid-cols-2">
                {/* Circular progress */}
                <div className="flex flex-col items-center justify-center gap-2">
                  <div
                    className="radial-progress text-amber-400"
                    style={{ "--value": percent, "--size": "9rem", "--thickness": "8px" }}
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span className="text-2xl font-bold text-slate-100">{percent}%</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    <span className="font-semibold text-amber-400">{solved}</span> / {total} solved
                  </p>
                </div>

                {/* Per-difficulty breakdown */}
                <div className="flex flex-col justify-center gap-4">
                  {diffStats.map(({ label, solved: s, total: t, color, bar }) => (
                    <div key={label}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className={`font-semibold ${color}`}>{label}</span>
                        <span className="text-slate-400">
                          {s} / {t}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
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
                  { icon: <CheckCircle2 size={22} />, value: solved, label: "Solved", color: "text-emerald-400" },
                  { icon: <Trophy size={22} />, value: `${percent}%`, label: "Completion", color: "text-amber-400" },
                  { icon: <Zap size={22} />, value: total - solved, label: "Remaining", color: "text-rose-400" },
                ].map(({ icon, value, label, color }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg"
                  >
                    <span className={color}>{icon}</span>
                    <span className={`text-2xl font-extrabold ${color}`}>{value}</span>
                    <span className="text-xs text-slate-500">{label}</span>
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
            className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/40 hover:shadow-amber-900/20"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
              <Code2 size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-100 group-hover:text-amber-300">Problem Set</p>
              <p className="text-sm text-slate-500">Browse & solve problems</p>
            </div>
          </NavLink>

          {/* Admin panel — only for admins */}
          {displayRole === "admin" && (
            <NavLink
              to="/admin"
              className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/40 hover:shadow-amber-900/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-100 group-hover:text-amber-300">Admin Panel</p>
                <p className="text-sm text-slate-500">Manage problems & content</p>
              </div>
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
