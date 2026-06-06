import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router";

// Same schema as AdminPanel
const problemSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    difficulty: z.enum(["easy", "medium", "hard"]),
    tags: z.array(z.string()).min(1, "At least one tag required"),
    visibleTestCases: z
        .array(
            z.object({
                input: z.string().min(1, "Input is required"),
                output: z.string().min(1, "Output is required"),
                explanation: z.string().optional().default(""),
            }),
        )
        .min(1, "At least one visible test case required"),
    hiddenTestCases: z
        .array(
            z.object({
                input: z.string().min(1, "Input is required"),
                output: z.string().min(1, "Output is required"),
            }),
        )
        .min(1, "At least one hidden test case required"),
    startCode: z
        .array(
            z.object({
                language: z.enum(["C++", "Java", "JavaScript"]),
                initialCode: z.string().min(1, "Initial code is required"),
            }),
        )
        .length(3, "All three languages required"),
    referenceSolution: z
        .array(
            z.object({
                language: z.enum(["C++", "Java", "JavaScript"]),
                completeCode: z.string().min(1, "Complete code is required"),
            }),
        )
        .length(3, "All three languages required"),
});

function AdminUpdate() {
    const navigate = useNavigate();

    // Phase 1: problem list
    const [problems, setProblems] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState(null);

    // Phase 2: selected problem & form
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [fetchingProblem, setFetchingProblem] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // { type: 'success'|'error', message }

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(problemSchema),
        defaultValues: {
            startCode: [
                { language: "C++", initialCode: "" },
                { language: "Java", initialCode: "" },
                { language: "JavaScript", initialCode: "" },
            ],
            referenceSolution: [
                { language: "C++", completeCode: "" },
                { language: "Java", completeCode: "" },
                { language: "JavaScript", completeCode: "" },
            ],
        },
    });

    const {
        fields: visibleFields,
        append: appendVisible,
        remove: removeVisible,
    } = useFieldArray({ control, name: "visibleTestCases" });

    const {
        fields: hiddenFields,
        append: appendHidden,
        remove: removeHidden,
    } = useFieldArray({ control, name: "hiddenTestCases" });

    // Fetch problem list on mount
    useEffect(() => {
        const fetchProblems = async () => {
            try {
                setListLoading(true);
                const { data } = await axiosClient.get("/problem/allProblem");
                setProblems(data);
            } catch (err) {
                setListError("Failed to fetch problems");
                console.error(err);
            } finally {
                setListLoading(false);
            }
        };
        fetchProblems();
    }, []);

    // When a problem is selected, fetch its full data and pre-fill the form
    const handleSelectProblem = async (problem) => {
        setFetchingProblem(true);
        setSubmitStatus(null);
        try {
            const { data } = await axiosClient.get(`/problem/getProblem/${problem._id}`);
            setSelectedProblem({ ...data, _id: problem._id });

            // Map API response → form shape
            const langOrder = ["C++", "Java", "JavaScript"];

            const startCode = langOrder.map((lang) => {
                const found = (data.starterCode || []).find((sc) => sc.language === lang);
                return { language: lang, initialCode: found?.initialCode || "" };
            });

            const referenceSolution = langOrder.map((lang) => {
                const found = (data.solution || []).find((s) => s.language === lang);
                return { language: lang, completeCode: found?.solutionCode || "" };
            });

            reset({
                title: data.title || "",
                description: data.description || "",
                difficulty: (data.difficulty || "Easy").toLowerCase(),
                tags: Array.isArray(data.tags) ? data.tags : [],
                visibleTestCases: (data.testCases || []).map((tc) => ({
                    input: tc.input || "",
                    output: tc.output || "",
                    explanation: tc.explanation || "",
                })),
                hiddenTestCases: (data.hiddenTestCases || []).map((tc) => ({
                    input: tc.input || "",
                    output: tc.output || "",
                })),
                startCode,
                referenceSolution,
            });
        } catch (err) {
            console.error(err);
            setSubmitStatus({ type: "error", message: "Failed to load problem data." });
        } finally {
            setFetchingProblem(false);
        }
    };

    const createSlug = (title) =>
        title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

    // --- Dynamic tag input helpers ---
    const [tagInput, setTagInput] = useState("");
    const currentTags = watch("tags") || [];

    const handleAddTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !currentTags.includes(trimmed)) {
            setValue("tags", [...currentTags, trimmed], { shouldValidate: true });
        }
        setTagInput("");
    };

    const handleRemoveTag = (tagToRemove) => {
        setValue(
            "tags",
            currentTags.filter((t) => t !== tagToRemove),
            { shouldValidate: true },
        );
    };

    const handleTagKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTag();
        }
    };

    const onSubmit = async (data) => {
        setSubmitStatus(null);
        const payload = {
            title: data.title,
            slug: createSlug(data.title),
            description: data.description,
            difficulty: data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1),
            tags: data.tags || [],
            constraints: data.constraints || [],
            testCases: data.visibleTestCases || [],
            hiddenTestCases: data.hiddenTestCases || [],
            starterCode: (data.startCode || []).map((item) => ({
                language: item.language,
                initialCode: item.initialCode,
            })),
            solution: (data.referenceSolution || []).map((item) => ({
                language: item.language,
                solutionCode: item.completeCode,
            })),
        };

        try {
            await axiosClient.patch(`/problem/update/${selectedProblem._id}`, payload);
            setSubmitStatus({ type: "success", message: "Problem updated successfully!" });
            setTimeout(() => navigate("/admin"), 1500);
        } catch (error) {
            const serverData = error?.response?.data;
            const serverMessage =
                typeof serverData === "string"
                    ? serverData
                    : serverData?.message || error.message;
            setSubmitStatus({ type: "error", message: `Error: ${serverMessage}` });
        }
    };

    // ── Phase 1: Problem list ───────────────────────────────────────────────────
    if (!selectedProblem) {
        return (
            <div className="container mx-auto min-h-screen p-6 md:p-8">
                <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-base-content md:text-4xl">
                    Update Problem
                </h1>
                <p className="mb-8 text-base-content/60">Select a problem to edit.</p>

                {listLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : listError ? (
                    <div className="alert alert-error">{listError}</div>
                ) : (
                    <div className="overflow-x-auto card border border-base-300 bg-base-100/90 shadow-xl">
                        <table className="table table-zebra w-full">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Title</th>
                                    <th>Difficulty</th>
                                    <th>Tags</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {problems.map((problem, index) => (
                                    <tr key={problem._id}>
                                        <th>{index + 1}</th>
                                        <td className="font-medium">{problem.title}</td>
                                        <td>
                                            <span
                                                className={`badge ${problem.difficulty === "Easy"
                                                        ? "badge-success"
                                                        : problem.difficulty === "Medium"
                                                            ? "badge-warning"
                                                            : "badge-error"
                                                    }`}
                                            >
                                                {problem.difficulty}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex flex-wrap gap-1">
                                                {Array.isArray(problem.tags) && problem.tags.length > 0 ? (
                                                    problem.tags.map((tag, tagIndex) => (
                                                        <span
                                                            key={`${problem._id}-tag-${tagIndex}`}
                                                            className="badge badge-outline text-xs"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-500">No tags</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleSelectProblem(problem)}
                                                className="btn btn-sm btn-warning"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    // ── Phase 2: Edit form ──────────────────────────────────────────────────────
    if (fetchingProblem) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="container mx-auto min-h-screen p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
                <button
                    type="button"
                    onClick={() => setSelectedProblem(null)}
                    className="btn btn-ghost btn-sm"
                >
                    ← Back
                </button>
                <h1 className="text-3xl font-extrabold tracking-tight text-base-content md:text-4xl">
                    Update Problem
                </h1>
            </div>

            {submitStatus && (
                <div
                    className={`alert ${submitStatus.type === "success" ? "alert-success" : "alert-error"} mb-6`}
                >
                    <span>{submitStatus.message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit, (validationErrors) => {
                console.error("Form validation errors:", validationErrors);
                setSubmitStatus({ type: "error", message: "Please fix the form errors before submitting." });
            })} className="space-y-6">
                {/* Basic Information */}
                <div className="card border border-base-300 bg-base-100/90 p-6 shadow-xl backdrop-blur-sm">
                    <h2 className="mb-4 text-xl font-semibold text-base-content">
                        Basic Information
                    </h2>
                    <div className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Title</span>
                            </label>
                            <input
                                {...register("title")}
                                className={`input input-bordered w-full border-base-300 bg-base-200/70 focus:border-primary focus:outline-none ${errors.title && "input-error"}`}
                            />
                            {errors.title && (
                                <span className="mt-1 text-sm text-error">{errors.title.message}</span>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Description</span>
                            </label>
                            <textarea
                                {...register("description")}
                                className={`textarea textarea-bordered h-32 w-full border-base-300 bg-base-200/70 focus:border-primary focus:outline-none ${errors.description && "textarea-error"}`}
                            />
                            {errors.description && (
                                <span className="mt-1 text-sm text-error">{errors.description.message}</span>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <div className="form-control w-1/2">
                                <label className="label">
                                    <span className="label-text font-medium">Difficulty</span>
                                </label>
                                <select
                                    {...register("difficulty")}
                                    className={`select select-bordered border-base-300 bg-base-200/70 focus:border-primary focus:outline-none ${errors.difficulty && "select-error"}`}
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>

                            <div className="form-control w-1/2">
                                <label className="label">
                                    <span className="label-text font-medium">Tags</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagKeyDown}
                                        placeholder="Type a tag and press Enter"
                                        className="input input-bordered flex-1 border-base-300 bg-base-200/70 focus:border-primary focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        className="btn btn-primary"
                                    >
                                        Add
                                    </button>
                                </div>
                                {/* Tag chips */}
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {currentTags.map((tag, index) => (
                                        <span
                                            key={`${tag}-${index}`}
                                            className="badge badge-lg badge-outline gap-1 border-primary/40 text-primary"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="btn btn-ghost btn-xs px-0.5 text-error hover:bg-transparent"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                {errors.tags && (
                                    <span className="mt-1 text-sm text-error">
                                        {errors.tags.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Test Cases */}
                <div className="card border border-base-300 bg-base-100/90 p-6 shadow-xl backdrop-blur-sm">
                    <h2 className="mb-4 text-xl font-semibold text-base-content">Test Cases</h2>

                    {/* Visible Test Cases */}
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium text-base-content">Visible Test Cases</h3>
                            <button
                                type="button"
                                onClick={() => appendVisible({ input: "", output: "", explanation: "" })}
                                className="btn btn-sm btn-primary text-primary-content"
                            >
                                Add Visible Case
                            </button>
                        </div>

                        {visibleFields.map((field, index) => (
                            <div
                                key={field.id}
                                className="space-y-2 rounded-xl border border-base-300 bg-base-200/40 p-4"
                            >
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => removeVisible(index)}
                                        className="btn btn-xs btn-error text-error-content"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <input
                                    {...register(`visibleTestCases.${index}.input`)}
                                    placeholder="Input"
                                    className="input input-bordered w-full border-base-300 bg-base-100"
                                />
                                <input
                                    {...register(`visibleTestCases.${index}.output`)}
                                    placeholder="Output"
                                    className="input input-bordered w-full border-base-300 bg-base-100"
                                />
                                <textarea
                                    {...register(`visibleTestCases.${index}.explanation`)}
                                    placeholder="Explanation"
                                    className="textarea textarea-bordered w-full border-base-300 bg-base-100"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Hidden Test Cases */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium text-base-content">Hidden Test Cases</h3>
                            <button
                                type="button"
                                onClick={() => appendHidden({ input: "", output: "" })}
                                className="btn btn-sm btn-primary text-primary-content"
                            >
                                Add Hidden Case
                            </button>
                        </div>

                        {hiddenFields.map((field, index) => (
                            <div
                                key={field.id}
                                className="space-y-2 rounded-xl border border-base-300 bg-base-200/40 p-4"
                            >
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => removeHidden(index)}
                                        className="btn btn-xs btn-error text-error-content"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <input
                                    {...register(`hiddenTestCases.${index}.input`)}
                                    placeholder="Input"
                                    className="input input-bordered w-full border-base-300 bg-base-100"
                                />
                                <input
                                    {...register(`hiddenTestCases.${index}.output`)}
                                    placeholder="Output"
                                    className="input input-bordered w-full border-base-300 bg-base-100"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Code Templates */}
                <div className="card border border-base-300 bg-base-100/90 p-6 shadow-xl backdrop-blur-sm">
                    <h2 className="mb-4 text-xl font-semibold text-base-content">Code Templates</h2>
                    <div className="space-y-6">
                        {[0, 1, 2].map((index) => (
                            <div key={index} className="space-y-2">
                                <h3 className="font-medium text-base-content">
                                    {index === 0 ? "C++" : index === 1 ? "Java" : "JavaScript"}
                                </h3>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Initial Code</span>
                                    </label>
                                    <pre className="rounded-xl border border-base-300 bg-base-200 p-4">
                                        <textarea
                                            {...register(`startCode.${index}.initialCode`)}
                                            className="w-full bg-transparent font-mono text-sm leading-6 text-base-content focus:outline-none"
                                            rows={6}
                                        />
                                    </pre>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Reference Solution</span>
                                    </label>
                                    <pre className="rounded-xl border border-base-300 bg-base-200 p-4">
                                        <textarea
                                            {...register(`referenceSolution.${index}.completeCode`)}
                                            className="w-full bg-transparent font-mono text-sm leading-6 text-base-content focus:outline-none"
                                            rows={6}
                                        />
                                    </pre>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`btn btn-warning btn-lg w-full shadow-lg ${isSubmitting ? "loading" : ""}`}
                >
                    {isSubmitting ? "Updating..." : "Update Problem"}
                </button>
            </form>
        </div>
    );
}

export default AdminUpdate;
