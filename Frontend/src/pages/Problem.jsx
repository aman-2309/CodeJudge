import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router";
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import Editorial from "../components/Editorial";
import ChatAi from "../components/ChatAi";

const langMap = {
  cpp: "C++",
  java: "Java",
  javascript: "JavaScript",
};

const submissionLanguageMap = {
  cpp: "C++",
  java: "Java",
  javascript: "Javascript",
};

const Problem = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [leftPaneWidth, setLeftPaneWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [activeRightTab, setActiveRightTab] = useState("code");
  const editorRef = useRef(null);
  const splitPaneRef = useRef(null);
  let { problemId } = useParams();

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (event) => {
      if (!splitPaneRef.current) return;

      const rect = splitPaneRef.current.getBoundingClientRect();
      const nextWidth = ((event.clientX - rect.left) / rect.width) * 100;
      const clampedWidth = Math.min(75, Math.max(25, nextWidth));
      setLeftPaneWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };



    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(
          `/problem/getProblem/${problemId}`,
        );

        const starterCode = response.data?.starterCode || [];
        const initialCode = starterCode.find(
          (sc) => sc.language === langMap[selectedLanguage],
        )?.initialCode;

        setProblem(response.data);

        setCode(initialCode || starterCode[0]?.initialCode || "");
        setLoading(false);
      } catch (error) {
        console.error("Error fetching problem:", error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  const handleEditorChange = (value) => {
    setCode(value || "");
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);

    if (problem) {
      const starterCode = problem?.starterCode || [];
      const initialCode = starterCode.find(
        (sc) => sc.language === langMap[language],
      )?.initialCode;
      setCode(initialCode || starterCode[0]?.initialCode || "");
    }
  };

  const handleResizeStart = (event) => {
    event.preventDefault();
    setIsResizing(true);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);

    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        sourceCode: code,
        language: submissionLanguageMap[selectedLanguage],
      });

      const testCases = Array.isArray(response.data) ? response.data : [];
      const allPassed =
        testCases.length > 0 && testCases.every((tc) => tc.status_id === 3);
      const runtime = testCases.reduce(
        (sum, tc) => sum + (Number(tc.time) || 0),
        0,
      );
      const memory = testCases.reduce(
        (max, tc) => Math.max(max, Number(tc.memory) || 0),
        0,
      );
      const firstFailed = testCases.find((tc) => tc.status_id !== 3);

      setRunResult({
        success: allPassed,
        runtime,
        memory,
        error: firstFailed?.status?.description || null,
        testCases,
      });
      setLoading(false);
      setActiveRightTab("testcase");
    } catch (error) {
      console.error("Error running code:", error);
      setRunResult({
        success: false,
        error: error.response?.data || "Internal server error",
        testCases: [],
      });
      setLoading(false);
      setActiveRightTab("testcase");
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);

    try {
      const response = await axiosClient.post(
        `/submission/submit/${problemId}`,
        {
          sourceCode: code,
          language: submissionLanguageMap[selectedLanguage],
        },
      );

      setSubmitResult(response.data);
      setLoading(false);
      setActiveRightTab("result");
    } catch (error) {
      console.error("Error submitting code:", error);
      setSubmitResult({
        status: "Error",
        errorMessage: error.response?.data || "Submission failed",
        passedTestCases: 0,
        totalTestCases: 0,
      });
      setLoading(false);
      setActiveRightTab("result");
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case "javascript":
        return "javascript";
      case "java":
        return "java";
      case "cpp":
        return "cpp";
      default:
        return "javascript";
    }
  };


  // Skeleton is handled inline to preserve DOM structure

  return (
    <div
      ref={splitPaneRef}
      className="h-[calc(100vh-4rem)] flex bg-base-100 overflow-hidden"
    >
      {/* Left Panel */}
      <div
        className="flex flex-col border-r border-base-300 min-w-0"
        style={{ width: `${leftPaneWidth}%` }}
      >
        {/* Left Tabs */}
        <div className="tabs tabs-bordered bg-base-200 px-4">
          <button
            className={`tab ${activeLeftTab === "description" ? "tab-active text-[#ffa116]" : "text-[#8a8a8a] hover:text-[#e0e0e0]"}`}
            onClick={() => setActiveLeftTab("description")}
          >
            Description
          </button>
          <button
            className={`tab ${activeLeftTab === "editorial" ? "tab-active text-[#ffa116]" : "text-[#8a8a8a] hover:text-[#e0e0e0]"}`}
            onClick={() => setActiveLeftTab("editorial")}
          >
            Editorial
          </button>
          <button
            className={`tab ${activeLeftTab === "solutions" ? "tab-active text-[#ffa116]" : "text-[#8a8a8a] hover:text-[#e0e0e0]"}`}
            onClick={() => setActiveLeftTab("solutions")}
          >
            Solutions
          </button>
          <button
            className={`tab ${activeLeftTab === "submissions" ? "tab-active text-[#ffa116]" : "text-[#8a8a8a] hover:text-[#e0e0e0]"}`}
            onClick={() => setActiveLeftTab("submissions")}
          >
            Submissions
          </button>

          <button
            className={`tab ${activeLeftTab === "chatAI" ? "tab-active text-[#ffa116]" : "text-[#8a8a8a] hover:text-[#e0e0e0]"}`}
            onClick={() => setActiveLeftTab("chatAI")}
          >
            ChatAI
          </button>
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && !problem ? (
            <div className="space-y-4">
              <div className="skeleton h-8 w-3/4 bg-[#333333] rounded"></div>
              <div className="flex gap-2 mb-6">
                <div className="skeleton h-6 w-16 rounded-md bg-[#333333]"></div>
                <div className="skeleton h-6 w-16 rounded-md bg-[#333333]"></div>
                <div className="skeleton h-6 w-16 rounded-md bg-[#333333]"></div>
              </div>
              <div className="skeleton h-4 w-full bg-[#333333] rounded"></div>
              <div className="skeleton h-4 w-full bg-[#333333] rounded"></div>
              <div className="skeleton h-4 w-5/6 bg-[#333333] rounded"></div>
              <div className="skeleton h-4 w-full mt-4 bg-[#333333] rounded"></div>
              <div className="skeleton h-4 w-4/5 bg-[#333333] rounded"></div>
              <div className="skeleton h-32 w-full mt-6 bg-[#333333] rounded"></div>
            </div>
          ) : problem ? (
            <>
              {activeLeftTab === "description" && (
                <div>
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-3">{problem.title}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Difficulty badge */}
                      <span
                        className={`badge badge-outline rounded-md font-semibold ${problem.difficulty?.toLowerCase() === "easy"
                          ? "border-[#2cbb5d] text-[#2cbb5d]"
                          : problem.difficulty?.toLowerCase() === "medium"
                            ? "border-[#ffc01e] text-[#ffc01e]"
                            : "border-[#ff375f] text-[#ff375f]"
                          }`}
                      >
                        {problem.difficulty}
                      </span>
                      {/* Tag badges */}
                      {Array.isArray(problem.tags) && problem.tags.length > 0 ? (
                        problem.tags.map((tag, index) => (
                          <span
                            key={`${tag}-${index}`}
                            className="badge badge-outline rounded-md border-[#3a3a3a] text-[#5c9eff]"
                          >
                            {tag}
                          </span>
                        ))
                      ) : null}
                    </div>
                  </div>

                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {problem.description}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Examples:</h3>
                    <div className="space-y-4">
                      {(problem.testCases || []).map((example, index) => (
                        <div key={index} className="bg-base-200 p-4 rounded-lg border border-base-300">
                          <h4 className="font-semibold mb-2">
                            Example {index + 1}:
                          </h4>
                          <div className="space-y-2 text-sm font-mono">
                            <div>
                              <strong>Input:</strong> {example.input}
                            </div>
                            <div>
                              <strong>Output:</strong> {example.output}
                            </div>
                            <div>
                              <strong>Explanation:</strong>{" "}
                              {example.explanation}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === "editorial" && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4">Editorial</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    <Editorial secureUrl={problem.secureUrl} thumnailUrl={problem.thumbnailUrl} duration={problem.duration}></Editorial>
                  </div>
                </div>
              )}

              {activeLeftTab === "solutions" && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Solutions</h2>
                  <div className="space-y-6">
                    {problem.solution?.length ? (
                      problem.solution.map((solution, index) => (
                        <div
                          key={index}
                          className="border border-base-300 rounded-lg"
                        >
                          <div className="bg-base-200 px-4 py-2 rounded-t-lg border-b border-base-300">
                            <h3 className="font-semibold">
                              {problem?.title} - {solution?.language}
                            </h3>
                          </div>
                          <div className="p-4">
                            <pre className="bg-base-300 p-4 rounded text-sm overflow-x-auto">
                              <code>{solution?.solutionCode}</code>
                            </pre>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[#8a8a8a]">
                        Solutions will be available after you solve the problem.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeLeftTab === "submissions" && (
                <div>
                  <h2 className="text-xl font-bold mb-4">My Submissions</h2>
                  <div className="text-[#8a8a8a]">
                    <SubmissionHistory problemId={problemId} />
                  </div>
                </div>
              )}

              {activeLeftTab === "chatAI" && (

                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4">CHAT with AI</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    <ChatAi problem={problem}></ChatAi>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      <div
        className={`w-2 cursor-col-resize bg-base-300 hover:bg-primary transition-colors ${isResizing ? "bg-primary" : ""}`}
        onMouseDown={handleResizeStart}
        role="separator"
        aria-orientation="vertical"
        aria-valuemin={25}
        aria-valuemax={75}
        aria-valuenow={Math.round(leftPaneWidth)}
      />

      {/* Right Panel */}
      <div
        className="flex flex-col min-w-0"
        style={{ width: `${100 - leftPaneWidth}%` }}
      >
        {/* Right Tabs */}
        <div className="tabs tabs-bordered bg-base-200 px-4">
          <button
            className={`tab ${activeRightTab === "code" ? "tab-active text-[#ffa116]" : "text-[#8a8a8a] hover:text-[#e0e0e0]"}`}
            onClick={() => setActiveRightTab("code")}
          >
            Code
          </button>
          <button
            className={`tab ${activeRightTab === "testcase" ? "tab-active text-[#ffa116]" : "text-[#8a8a8a] hover:text-[#e0e0e0]"}`}
            onClick={() => setActiveRightTab("testcase")}
          >
            Testcase
          </button>
          <button
            className={`tab ${activeRightTab === "result" ? "tab-active text-[#ffa116]" : "text-[#8a8a8a] hover:text-[#e0e0e0]"}`}
            onClick={() => setActiveRightTab("result")}
          >
            Result
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col">
          {loading && !problem ? (
            <div className="flex-1 flex flex-col p-4">
              <div className="flex gap-2 mb-4">
                <div className="skeleton h-8 w-16 bg-[#333333] rounded"></div>
                <div className="skeleton h-8 w-24 bg-[#333333] rounded"></div>
                <div className="skeleton h-8 w-16 bg-[#333333] rounded"></div>
              </div>
              <div className="skeleton flex-1 w-full mb-4 bg-[#333333] rounded"></div>
              <div className="flex justify-between pt-4 border-t border-base-300">
                <div className="skeleton h-8 w-20 bg-[#333333] rounded"></div>
                <div className="flex gap-2">
                  <div className="skeleton h-8 w-16 bg-[#333333] rounded"></div>
                  <div className="skeleton h-8 w-20 bg-[#333333] rounded"></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {activeRightTab === "code" && (
                <div className="flex-1 flex flex-col">
                  {/* Language Selector */}
                  <div className="flex justify-between items-center p-4 border-b border-base-300">
                    <div className="flex gap-2">
                      {["cpp", "javascript", "java"].map((lang) => (
                        <button
                          key={lang}
                          className={`btn btn-sm rounded-md ${selectedLanguage === lang ? "btn-primary" : "btn-ghost"}`}
                          onClick={() => handleLanguageChange(lang)}
                        >
                          {lang === "cpp"
                            ? "C++"
                            : lang === "javascript"
                              ? "JavaScript"
                              : "Java"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Monaco Editor */}
                  <div className="flex-1">
                    <Editor
                      height="100%"
                      language={getLanguageForMonaco(selectedLanguage)}
                      value={code}
                      onChange={handleEditorChange}
                      onMount={handleEditorDidMount}
                      theme="vs-dark"
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        insertSpaces: true,
                        wordWrap: "on",
                        lineNumbers: "on",
                        glyphMargin: false,
                        folding: true,
                        lineDecorationsWidth: 10,
                        lineNumbersMinChars: 3,
                        renderLineHighlight: "line",
                        selectOnLineNumbers: true,
                        roundedSelection: false,
                        readOnly: false,
                        cursorStyle: "line",
                        mouseWheelZoom: true,
                      }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 border-t border-base-300 flex justify-between">
                    <div className="flex gap-2">
                      <button
                        className="btn btn-ghost btn-sm rounded-md"
                        onClick={() => setActiveRightTab("testcase")}
                      >
                        Console
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className={`btn btn-outline btn-sm rounded-md ${loading ? "loading" : ""}`}
                        onClick={handleRun}
                        disabled={loading}
                      >
                        Run
                      </button>
                      <button
                        className={`btn btn-primary btn-sm rounded-md ${loading ? "loading" : ""}`}
                        onClick={handleSubmitCode}
                        disabled={loading}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeRightTab === "testcase" && (
                <div className="flex-1 p-4 overflow-y-auto">
                  <h3 className="font-semibold mb-4">Test Results</h3>
                  {runResult ? (
                    <div
                      className={`alert rounded-md ${runResult.success ? "alert-success" : "alert-error"} mb-4`}
                    >
                      <div>
                        {runResult.success ? (
                          <div>
                            <h4 className="font-bold">✅ All test cases passed!</h4>
                            <p className="text-sm mt-2">
                              Runtime: {runResult.runtime + " sec"}
                            </p>
                            <p className="text-sm">
                              Memory: {runResult.memory + " KB"}
                            </p>

                            <div className="mt-4 space-y-2">
                              {runResult.testCases.map((tc, i) => (
                                <div
                                  key={i}
                                  className="bg-base-100 p-3 rounded text-xs"
                                >
                                  <div className="font-mono">
                                    <div>
                                      <strong>Input:</strong> {tc.stdin}
                                    </div>
                                    <div>
                                      <strong>Expected:</strong>{" "}
                                      {tc.expected_output}
                                    </div>
                                    <div>
                                      <strong>Output:</strong> {tc.stdout}
                                    </div>
                                    <div className={"text-[#2cbb5d]"}>
                                      {"✓ Passed"}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-bold">❌ Error</h4>
                            {runResult.error ? (
                              <p className="text-sm mt-2">{runResult.error}</p>
                            ) : null}
                            <div className="mt-4 space-y-2">
                              {(runResult.testCases || []).map((tc, i) => (
                                <div
                                  key={i}
                                  className="bg-base-100 p-3 rounded text-xs"
                                >
                                  <div className="font-mono">
                                    <div>
                                      <strong>Input:</strong> {tc.stdin}
                                    </div>
                                    <div>
                                      <strong>Expected:</strong>{" "}
                                      {tc.expected_output}
                                    </div>
                                    <div>
                                      <strong>Output:</strong> {tc.stdout}
                                    </div>
                                    <div
                                      className={
                                        tc.status_id == 3
                                          ? "text-[#2cbb5d]"
                                          : "text-[#ff375f]"
                                      }
                                    >
                                      {tc.status_id == 3 ? "✓ Passed" : "✗ Failed"}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[#8a8a8a]">
                      Click "Run" to test your code with the example test cases.
                    </div>
                  )}
                </div>
              )}

              {activeRightTab === "result" && (
                <div className="flex-1 p-4 overflow-y-auto">
                  <h3 className="font-semibold mb-4">Submission Result</h3>
                  {submitResult ? (
                    <div
                      className={`alert rounded-md ${submitResult.status === "Accepted" ? "alert-success" : "alert-error"}`}
                    >
                      <div>
                        {submitResult.status === "Accepted" ? (
                          <div>
                            <h4 className="font-bold text-lg">🎉 Accepted</h4>
                            <div className="mt-4 space-y-2">
                              <p>
                                Test Cases Passed: {submitResult.passedTestCases}/
                                {submitResult.totalTestCases}
                              </p>
                              <p>Runtime: {submitResult.runTime + " sec"}</p>
                              <p>Memory: {submitResult.memory + "KB"} </p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-bold text-lg">
                              ❌ {submitResult.errorMessage || submitResult.status}
                            </h4>
                            <div className="mt-4 space-y-2">
                              <p>
                                Test Cases Passed: {submitResult.passedTestCases}/
                                {submitResult.totalTestCases}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[#8a8a8a]">
                      Click "Submit" to submit your solution for evaluation.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Problem;