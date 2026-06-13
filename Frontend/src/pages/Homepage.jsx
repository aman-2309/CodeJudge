import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import axiosClient from "../utils/axiosClient";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const STATUSES = ["Solved", "Attempted", "Todo"];

function Homepage() {
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [attemptedProblems, setAttemptedProblems] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(true);
        const { data } = await axiosClient.get("/problem/allProblem");
        setProblems(data);
      } catch (error) {
        console.error("Error fetching problems:", error);
      } finally {
        setLoading(false);
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

  // Color helpers for difficulty chips (LeetCode palette)
  const diffColor = (d) => {
    switch (d.toLowerCase()) {
      case "easy": return "border-[#2cbb5d] text-[#2cbb5d]";
      case "medium": return "border-[#ffc01e] text-[#ffc01e]";
      case "hard": return "border-[#ff375f] text-[#ff375f]";
      default: return "border-[#3a3a3a] text-[#8a8a8a]";
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e0e0e0]">
      {/* Main Content */}
      <div className="container mx-auto p-4 md:p-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-[#3a3a3a] bg-[#262626] p-4 shadow-sm"
        >
          {/* Status popup button */}
          <button
            type="button"
            onClick={openStatusPopup}
            className="btn btn-sm border-[#3a3a3a] bg-[#2a2a2a] text-[#e0e0e0] hover:border-[#ffa116] hover:bg-[#333333] rounded-md"
          >
            Status
            {selectedStatus.length > 0 && (
              <span className="badge badge-sm ml-1 border-none bg-[#ffa116] text-[#1a1a1a] font-semibold">
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
                  className={`badge badge-sm badge-outline font-semibold rounded-md ${s === "Solved" ? "border-[#2cbb5d] text-[#2cbb5d]" :
                    s === "Attempted" ? "border-[#ffc01e] text-[#ffc01e]" :
                      "border-[#3a3a3a] text-[#8a8a8a]"
                    }`}
                >
                  {s}
                </span>
              ))}
              <button
                type="button"
                onClick={() => setSelectedStatus([])}
                className="btn btn-ghost btn-xs text-[#8a8a8a] hover:text-[#ff375f]"
              >
                ✕
              </button>
            </div>
          )}

          {/* Separator */}
          <div className="h-5 w-px bg-[#3a3a3a]" />

          {/* Difficulty popup button */}
          <button
            type="button"
            onClick={openDiffPopup}
            className="btn btn-sm border-[#3a3a3a] bg-[#2a2a2a] text-[#e0e0e0] hover:border-[#ffa116] hover:bg-[#333333] rounded-md"
          >
            Difficulty
            {selectedDifficulties.length > 0 && (
              <span className="badge badge-sm ml-1 border-none bg-[#ffa116] text-[#1a1a1a] font-semibold">
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
                  className={`badge badge-sm badge-outline font-semibold rounded-md ${diffColor(d)}`}
                >
                  {d}
                </span>
              ))}
              <button
                type="button"
                onClick={() => setSelectedDifficulties([])}
                className="btn btn-ghost btn-xs text-[#8a8a8a] hover:text-[#ff375f]"
              >
                ✕
              </button>
            </div>
          )}

          {/* Separator */}
          <div className="h-5 w-px bg-[#3a3a3a]" />

          {/* Tag popup button */}
          <button
            type="button"
            onClick={openTagPopup}
            className="btn btn-sm border-[#3a3a3a] bg-[#2a2a2a] text-[#e0e0e0] hover:border-[#ffa116] hover:bg-[#333333] rounded-md"
          >
            Tags
            {selectedTags.length > 0 && (
              <span className="badge badge-sm ml-1 border-none bg-[#ffa116] text-[#1a1a1a] font-semibold">
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
                  className="badge badge-sm badge-outline rounded-md border-[#3a3a3a] text-[#5c9eff]"
                >
                  {tag}
                </span>
              ))}
              <button
                type="button"
                onClick={() => setSelectedTags([])}
                className="btn btn-ghost btn-xs text-[#8a8a8a] hover:text-[#ff375f]"
              >
                ✕
              </button>
            </div>
          )}
        </motion.div>

        {/* Problems List */}
        <div className="grid gap-2">
          {loading ? (
            Array(5).fill(0).map((_, index) => (
              <div key={index} className="card border border-[#3a3a3a] bg-[#262626] rounded-lg">
                <div className="flex gap-4 items-center p-4">
                  <div className="skeleton h-4 w-8 rounded bg-[#333333]"></div>
                  <div className="skeleton h-4 w-64 rounded bg-[#333333]"></div>
                  <div className="skeleton h-4 w-12 rounded-full ml-auto bg-[#333333]"></div>
                </div>
              </div>
            ))
          ) : (
            filteredProblems.map((problem, idx) => (
              <motion.div
                key={problem._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.4) }}
                whileHover={{ scale: 1.005 }}
                className="card border border-[#3a3a3a] bg-[#262626] rounded-lg transition-colors duration-150 hover:border-[#4a4a4a] hover:bg-[#2d2d2d]"
              >
                <div className="card-body gap-2 py-3 px-4">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-4">
                    <NavLink
                      to={`/problem/${problem._id}`}
                      className="text-base font-medium text-[#e0e0e0] transition-colors hover:text-[#ffa116] leading-snug"
                    >
                      {problem.title}
                    </NavLink>
                    {solvedProblems.some((sp) => sp._id === problem._id) ? (
                      <span className="shrink-0 badge badge-outline rounded-md border-[#2cbb5d] text-[#2cbb5d] gap-1 font-medium">
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
                      <span className="shrink-0 badge badge-outline rounded-md border-[#ffc01e] text-[#ffc01e] gap-1 font-medium">
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
                      className={`badge badge-outline rounded-md font-medium text-xs ${problem.difficulty?.toLowerCase() === "easy"
                        ? "border-[#2cbb5d] text-[#2cbb5d]"
                        : problem.difficulty?.toLowerCase() === "medium"
                          ? "border-[#ffc01e] text-[#ffc01e]"
                          : "border-[#ff375f] text-[#ff375f]"
                        }`}
                    >
                      {problem.difficulty}
                    </span>
                    {problem.tags.map((tag, index) => (
                      <span key={index} className="badge badge-outline rounded-md border-[#3a3a3a] text-[#5c9eff] text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )))}
        </div>
      </div>

      {/* ── Status Filter Popup ──────────────────────────────────────── */}
      {statusPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-xs rounded-lg border border-[#3a3a3a] bg-[#262626] p-6 shadow-2xl"
          >
            <h3 className="mb-4 text-lg font-semibold text-[#e0e0e0]">
              Filter by Status
            </h3>

            <div className="space-y-2">
              {STATUSES.map((s) => (
                <label
                  key={s}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-[#333333]"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    style={{
                      "--chkbg":
                        s === "Solved" ? "#2cbb5d" : s === "Attempted" ? "#ffc01e" : "#8a8a8a",
                      "--chkfg": "#1a1a1a",
                    }}
                    checked={pendingStatus.includes(s)}
                    onChange={() => togglePendingStatus(s)}
                  />
                  <span className={`text-sm font-medium ${s === "Solved" ? "text-[#2cbb5d]" : s === "Attempted" ? "text-[#ffc01e]" : "text-[#8a8a8a]"
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
                className="btn btn-ghost btn-sm text-[#8a8a8a] hover:text-[#ff375f]"
              >
                Clear All
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatusPopupOpen(false)}
                  className="btn btn-ghost btn-sm rounded-md text-[#e0e0e0]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyStatus}
                  className="btn btn-sm rounded-md border-none bg-[#ffa116] text-[#1a1a1a] hover:bg-[#ffb84d]"
                >
                  Apply ({pendingStatus.length})
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Difficulty Filter Popup ──────────────────────────────────────── */}
      {diffPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-xs rounded-lg border border-[#3a3a3a] bg-[#262626] p-6 shadow-2xl"
          >
            <h3 className="mb-4 text-lg font-semibold text-[#e0e0e0]">
              Filter by Difficulty
            </h3>

            <div className="space-y-2">
              {DIFFICULTIES.map((d) => (
                <label
                  key={d}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-[#333333]"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    style={{
                      "--chkbg":
                        d === "Easy" ? "#2cbb5d" : d === "Medium" ? "#ffc01e" : "#ff375f",
                      "--chkfg": "#1a1a1a",
                    }}
                    checked={pendingDifficulties.includes(d)}
                    onChange={() => togglePendingDiff(d)}
                  />
                  <span className={`text-sm font-medium ${diffColor(d)}`}>
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
                className="btn btn-ghost btn-sm text-[#8a8a8a] hover:text-[#ff375f]"
              >
                Clear All
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDiffPopupOpen(false)}
                  className="btn btn-ghost btn-sm rounded-md text-[#e0e0e0]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyDifficulties}
                  className="btn btn-sm rounded-md border-none bg-[#ffa116] text-[#1a1a1a] hover:bg-[#ffb84d]"
                >
                  Apply ({pendingDifficulties.length})
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Tag Filter Popup ──────────────────────────────────────────────── */}
      {tagPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-md rounded-lg border border-[#3a3a3a] bg-[#262626] p-6 shadow-2xl"
          >
            <h3 className="mb-4 text-lg font-semibold text-[#e0e0e0]">
              Filter by Tags
            </h3>

            {allTags.length === 0 ? (
              <p className="py-4 text-center text-[#8a8a8a]">
                No tags available.
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                {allTags.map((tag) => (
                  <label
                    key={tag}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-[#333333]"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      style={{
                        "--chkbg": "#ffa116",
                        "--chkfg": "#1a1a1a",
                      }}
                      checked={pendingTags.includes(tag)}
                      onChange={() => togglePendingTag(tag)}
                    />
                    <span className="text-sm text-[#e0e0e0]">{tag}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPendingTags([])}
                className="btn btn-ghost btn-sm text-[#8a8a8a] hover:text-[#ff375f]"
              >
                Clear All
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTagPopupOpen(false)}
                  className="btn btn-ghost btn-sm rounded-md text-[#e0e0e0]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyTags}
                  className="btn btn-sm rounded-md border-none bg-[#ffa116] text-[#1a1a1a] hover:bg-[#ffb84d]"
                >
                  Apply ({pendingTags.length})
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Homepage;