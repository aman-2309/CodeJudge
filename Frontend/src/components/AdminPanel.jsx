import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router";

// Zod schema matching the problem schema
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
        explanation: z.string().min(1, "Explanation is required"),
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

function AdminCreate() {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
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
  } = useFieldArray({
    control,
    name: "visibleTestCases",
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden,
  } = useFieldArray({
    control,
    name: "hiddenTestCases",
  });

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
    const payload = {
      title: data.title,
      slug: createSlug(data.title),
      description: data.description,
      difficulty:
        data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1),
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
      await axiosClient.post("/problem/create", payload);
      alert("Problem created successfully!");
      navigate("/");
    } catch (error) {
      const serverData = error?.response?.data;
      const serverMessage =
        typeof serverData === "string"
          ? serverData
          : serverData?.message || error.message;

      alert(`Error: ${serverMessage}`);
    }
  };

  return (
    <div className="container mx-auto min-h-screen p-6 md:p-8">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-base-content md:text-4xl">
        Create New Problem
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="card border border-[#3a3a3a] bg-[#262626] p-6 rounded-lg">
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
                <span className="mt-1 text-sm text-error">
                  {errors.title.message}
                </span>
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
                <span className="mt-1 text-sm text-error">
                  {errors.description.message}
                </span>
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
        <div className="card border border-[#3a3a3a] bg-[#262626] p-6 rounded-lg">
          <h2 className="mb-4 text-xl font-semibold text-base-content">
            Test Cases
          </h2>

          {/* Visible Test Cases */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-base-content">
                Visible Test Cases
              </h3>
              <button
                type="button"
                onClick={() =>
                  appendVisible({ input: "", output: "", explanation: "" })
                }
                className="btn btn-sm btn-primary text-primary-content"
              >
                Add Visible Case
              </button>
            </div>

            {visibleFields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-2 rounded-lg border border-[#3a3a3a] bg-[#1a1a1a]/50 p-4"
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
              <h3 className="font-medium text-base-content">
                Hidden Test Cases
              </h3>
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
                className="space-y-2 rounded-lg border border-[#3a3a3a] bg-[#1a1a1a]/50 p-4"
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
        <div className="card border border-[#3a3a3a] bg-[#262626] p-6 rounded-lg">
          <h2 className="mb-4 text-xl font-semibold text-base-content">
            Code Templates
          </h2>

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
                  <pre className="rounded-lg border border-[#3a3a3a] bg-[#1a1a1a] p-4">
                    <textarea
                      {...register(`startCode.${index}.initialCode`)}
                      className="w-full bg-transparent font-mono text-sm leading-6 text-base-content focus:outline-none"
                      rows={6}
                    />
                  </pre>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Reference Solution
                    </span>
                  </label>
                  <pre className="rounded-lg border border-[#3a3a3a] bg-[#1a1a1a] p-4">
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
          className="btn btn-primary btn-lg w-full rounded-md border-none bg-[#ffa116] text-[#1a1a1a] hover:bg-[#ffb84d]"
        >
          Create Problem
        </button>
      </form>
    </div>
  );
}

export default AdminCreate;
