import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const STATUSES = ["Solved", "Attempted", "Todo"];

function Homepage() {
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [attemptedProblems, setAttemptedProblems] = useState([]);

  // All distinct tags from DB
  const [allTags, setAllTags] = useState([]);

  // Status filter
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [statusPopupOpen, setStatusPopupOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState([]);

  // Multi-select difficulties
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [diffPopupOpen, setDiffPopupOpen] = useState(false);
  const [pendingDifficulties, setPendingDifficulties] = useState([]);

  // Multi-select tags
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagPopupOpen, setTagPopupOpen] = useState(false);
  const [pendingTags, setPendingTags] = useState([]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/allProblem");
        setProblems(data);
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/problemSolved");
        setSolvedProblems(data);
      } catch (error) {
        console.error("Error fetching solved problems:", error);
      }
    };

    const fetchAttemptedProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/problemAttempted");
        setAttemptedProblems(data);
      } catch (error) {
        console.error("Error fetching attempted problems:", error);
      }
    };

    const fetchTags = async () => {
      try {
        const { data } = await axiosClient.get("/problem/allTags");
        setAllTags(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchProblems();
    fetchTags();
    if (user) {
      fetchSolvedProblems();
      fetchAttemptedProblems();
    }
  }, [user]);

  const filteredProblems = problems.filter((problem) => {
    // OR-based difficulty: show all if none selected
    const difficultyMatch =
      selectedDifficulties.length === 0 ||
      selectedDifficulties.some(
        (d) => d.toLowerCase() === problem.difficulty?.toLowerCase(),
      );

    const isSolved = solvedProblems.some((sp) => sp._id === problem._id);
    const isAttempted = attemptedProblems.some((ap) => ap._id === problem._id);

    const statusMatch =
      selectedStatus.length === 0 ||
      selectedStatus.some((s) => {
        if (s.toLowerCase() === "solved") return isSolved;
        if (s.toLowerCase() === "attempted") return isAttempted && !isSolved;
        if (s.toLowerCase() === "todo") return !isSolved && !isAttempted;
        return false;
      });

    // OR-based tag: show all if none selected
    const tagMatch =
      selectedTags.length === 0 ||
      problem.tags.some((t) => selectedTags.includes(t));

    return difficultyMatch && statusMatch && tagMatch;
  });

  // --- Status popup handlers ---
  const openStatusPopup = () => {
    setPendingStatus([...selectedStatus]);
    setStatusPopupOpen(true);
  };
  const togglePendingStatus = (s) => {
    setPendingStatus((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };
  const applyStatus = () => {
    setSelectedStatus(pendingStatus);
    setStatusPopupOpen(false);
  };

  // --- Difficulty popup handlers ---
  const openDiffPopup = () => {
    setPendingDifficulties([...selectedDifficulties]);
    setDiffPopupOpen(true);
  };
  const togglePendingDiff = (d) => {
    setPendingDifficulties((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };
  const applyDifficulties = () => {
    setSelectedDifficulties(pendingDifficulties);
    setDiffPopupOpen(false);
  };

  // --- Tag popup handlers ---
  const openTagPopup = () => {
    setPendingTags([...selectedTags]);
    setTagPopupOpen(true);
  };
  const togglePendingTag = (tag) => {
    setPendingTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };
  const applyTags = () => {
    setSelectedTags(pendingTags);
    setTagPopupOpen(false);
  };

  // Color helpers for difficulty chips
  const diffColor = (d) => {
    switch (d.toLowerCase()) {
      case "easy":   return "border-green-500 text-green-400";
      case "medium": return "border-yellow-500 text-yellow-400";
      case "hard":   return "border-red-500 text-red-400";
      default:       return "border-slate-500 text-slate-400";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Main Content */}
      <div className="container mx-auto p-4 md:p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg">
          {/* Status popup button */}
          <button
            type="button"
            onClick={openStatusPopup}
            className="btn btn-sm border-slate-700 bg-slate-800 text-slate-100 hover:border-amber-400 hover:bg-slate-700"
          >
            Status
            {selectedStatus.length > 0 && (
              <span className="badge badge-sm badge-warning ml-1">
                {selectedStatus.length}
              </span>
            )}
          </button>

          {/* Active status chips */}
          {selectedStatus.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedStatus.map((s) => (
                <span
                  key={s}
                  className={`badge badge-sm badge-outline font-semibold ${
                    s === "Solved" ? "border-green-500 text-green-400" :
                    s === "Attempted" ? "border-yellow-500 text-yellow-400" :
                    "border-slate-500 text-slate-400"
                  }`}
                >
                  {s}
                </span>
              ))}
              <button
                type="button"
                onClick={() => setSelectedStatus([])}
                className="btn btn-ghost btn-xs text-slate-400 hover:text-rose-400"
              >
                ✕
              </button>
            </div>
          )}

          {/* Separator */}
          <div className="h-5 w-px bg-slate-700" />

          {/* Difficulty popup button */}
          <button
            type="button"
            onClick={openDiffPopup}
            className="btn btn-sm border-slate-700 bg-slate-800 text-slate-100 hover:border-amber-400 hover:bg-slate-700"
          >
            Difficulty
            {selectedDifficulties.length > 0 && (
              <span className="badge badge-sm badge-warning ml-1">
                {selectedDifficulties.length}
              </span>
            )}
          </button>

          {/* Active difficulty chips */}
          {selectedDifficulties.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedDifficulties.map((d) => (
                <span
                  key={d}
                  className={`badge badge-sm badge-outline font-semibold ${diffColor(d)}`}
                >
                  {d}
                </span>
              ))}
              <button
                type="button"
                onClick={() => setSelectedDifficulties([])}
                className="btn btn-ghost btn-xs text-slate-400 hover:text-rose-400"
              >
                ✕
              </button>
            </div>
          )}

          {/* Separator */}
          <div className="h-5 w-px bg-slate-700" />

          {/* Tag popup button */}
          <button
            type="button"
            onClick={openTagPopup}
            className="btn btn-sm border-slate-700 bg-slate-800 text-slate-100 hover:border-amber-400 hover:bg-slate-700"
          >
            Tags
            {selectedTags.length > 0 && (
              <span className="badge badge-sm badge-warning ml-1">
                {selectedTags.length}
              </span>
            )}
          </button>

          {/* Active tag chips */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="badge badge-sm badge-outline badge-info"
                >
                  {tag}
                </span>
              ))}
              <button
                type="button"
                onClick={() => setSelectedTags([])}
                className="btn btn-ghost btn-xs text-slate-400 hover:text-rose-400"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Problems List */}
        <div className="grid gap-4">
          {filteredProblems.map((problem) => (
            <div
              key={problem._id}
              className="card border border-slate-800 bg-slate-900/80 shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-600 hover:shadow-2xl"
            >
              <div className="card-body gap-2 py-4">
                {/* Title row */}
                <div className="flex items-start justify-between gap-4">
                  <NavLink
                    to={`/problem/${problem._id}`}
                    className="text-lg font-semibold text-slate-100 transition-colors hover:text-amber-300 leading-snug"
                  >
                    {problem.title}
                  </NavLink>
                  {solvedProblems.some((sp) => sp._id === problem._id) ? (
                    <span className="shrink-0 badge badge-outline border-emerald-500 text-emerald-400 gap-1 font-medium">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Solved
                    </span>
                  ) : attemptedProblems.some((ap) => ap._id === problem._id) ? (
                    <span className="shrink-0 badge badge-outline border-yellow-500 text-yellow-400 gap-1 font-medium">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6v4l2 2" />
                      </svg>
                      Attempted
                    </span>
                  ) : null}
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`badge badge-outline font-semibold ${
                      problem.difficulty?.toLowerCase() === "easy"
                        ? "border-green-500 text-green-500"
                        : problem.difficulty?.toLowerCase() === "medium"
                          ? "border-yellow-500 text-yellow-500"
                          : "border-red-500 text-red-500"
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                  {problem.tags.map((tag, index) => (
                    <span key={index} className="badge badge-outline badge-info">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Status Filter Popup ──────────────────────────────────────── */}
      {statusPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-slate-100">
              Filter by Status
            </h3>

            <div className="space-y-2">
              {STATUSES.map((s) => (
                <label
                  key={s}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-800"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    style={{
                      "--chkbg":
                        s === "Solved" ? "#22c55e" : s === "Attempted" ? "#eab308" : "#94a3b8",
                      "--chkfg": "white",
                    }}
                    checked={pendingStatus.includes(s)}
                    onChange={() => togglePendingStatus(s)}
                  />
                  <span className={`text-sm font-semibold ${
                    s === "Solved" ? "text-green-400" : s === "Attempted" ? "text-yellow-400" : "text-slate-400"
                  }`}>
                    {s}
                  </span>
                </label>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPendingStatus([])}
                className="btn btn-ghost btn-sm text-slate-400 hover:text-rose-400"
              >
                Clear All
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatusPopupOpen(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyStatus}
                  className="btn btn-warning btn-sm"
                >
                  Apply ({pendingStatus.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Difficulty Filter Popup ──────────────────────────────────────── */}
      {diffPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-slate-100">
              Filter by Difficulty
            </h3>

            <div className="space-y-2">
              {DIFFICULTIES.map((d) => (
                <label
                  key={d}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-800"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    style={{
                      "--chkbg":
                        d === "Easy" ? "#22c55e" : d === "Medium" ? "#eab308" : "#ef4444",
                      "--chkfg": "white",
                    }}
                    checked={pendingDifficulties.includes(d)}
                    onChange={() => togglePendingDiff(d)}
                  />
                  <span className={`text-sm font-semibold ${diffColor(d)}`}>
                    {d}
                  </span>
                </label>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPendingDifficulties([])}
                className="btn btn-ghost btn-sm text-slate-400 hover:text-rose-400"
              >
                Clear All
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDiffPopupOpen(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyDifficulties}
                  className="btn btn-warning btn-sm"
                >
                  Apply ({pendingDifficulties.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tag Filter Popup ──────────────────────────────────────────────── */}
      {tagPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-slate-100">
              Filter by Tags
            </h3>

            {allTags.length === 0 ? (
              <p className="py-4 text-center text-slate-400">
                No tags available.
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                {allTags.map((tag) => (
                  <label
                    key={tag}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-800"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-warning"
                      checked={pendingTags.includes(tag)}
                      onChange={() => togglePendingTag(tag)}
                    />
                    <span className="text-sm text-slate-200">{tag}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPendingTags([])}
                className="btn btn-ghost btn-sm text-slate-400 hover:text-rose-400"
              >
                Clear All
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTagPopupOpen(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyTags}
                  className="btn btn-warning btn-sm"
                >
                  Apply ({pendingTags.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Homepage;
