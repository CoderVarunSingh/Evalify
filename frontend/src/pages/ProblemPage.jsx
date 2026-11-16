import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { problemsData } from "../data/problemsData";
import { PROBLEMS } from "../data/problems";
import { LANGUAGE_CONFIG } from "../data/languageConfig";
import Navbar from "../components/Navbar";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";
import { executeCode } from "../lib/piston";

import toast from "react-hot-toast";
import confetti from "canvas-confetti";

import { isProblemSolved, markProblemAsSolved } from "../lib/solvedStorage";

function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Helper to find problem by id
  const getProblemById = (pid) => problemsData.find((p) => p._id === pid);

  const [currentProblemId, setCurrentProblemId] = useState(id || (problemsData[0]?._id));
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const decodedId = decodeURIComponent(id || currentProblemId || "");
  const titleBase = decodedId.split(" - ")[0].trim();
  const baseProblem =
    getProblemById(decodedId) ||
    problemsData.find((p) => p.title === decodedId) ||
    problemsData.find((p) => p.title === titleBase) ||
    problemsData[0];

  const slug = (baseProblem?.title || decodedId)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const richProblem = PROBLEMS[slug] || PROBLEMS[decodedId] || PROBLEMS[baseProblem?._id] || {};

  const currentProblem = baseProblem
    ? {
        ...baseProblem,
        ...richProblem,
        description: richProblem.description || baseProblem.description,
        starterCode: {
          ...baseProblem.starterCode,
          ...richProblem.starterCode,
        },
        examples: richProblem.examples?.length ? richProblem.examples : (baseProblem.examples || []),
        constraints: richProblem.constraints?.length ? richProblem.constraints : (baseProblem.constraints || []),
        testCases: baseProblem.testCases?.length
          ? baseProblem.testCases
          : (richProblem.examples?.map((ex) => ({
              input: ex.input,
              expectedOutput: ex.output,
            })) || []),
      }
    : null;

  if (!currentProblem) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">Problem not found</h2>
          <p className="text-base-content/70">The requested problem could not be located. Please return to the problems list.</p>
        </div>
      </div>
    );
  }

  const getDefaultStarterCode = (lang, problemTitle) => {
    const fnName =
      (problemTitle || "solution")
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .split(" ")
        .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join("") || "solution";

    switch (lang) {
      case "python":
        return `def ${fnName}():\n    # Write your solution here\n    return "Success"\n\n# Test call\nprint(${fnName}())`;
      case "java":
        return `class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n        System.out.println("Success");\n    }\n}`;
      case "cpp":
        return `#include <iostream>\n\nint main() {\n    // Write your solution here\n    std::cout << "Success" << std::endl;\n    return 0;\n}`;
      case "javascript":
      default:
        return `function ${fnName}() {\n  // Write your solution here\n  return "Success";\n}\n\n// Test call\nconsole.log(${fnName}());`;
    }
  };

  useEffect(() => {
    setOutput(null);
    setTestResults(null);
    if (currentProblem) {
      const starter =
        currentProblem.starterCode?.[selectedLanguage] ||
        getDefaultStarterCode(selectedLanguage, currentProblem.title);
      setCode(starter);
      setCustomInput(currentProblem.defaultInput?.[selectedLanguage] || "");
      setIsSolved(isProblemSolved(currentProblem));
    }
  }, [id, currentProblemId, selectedLanguage]);

  // Sync URL param with internal state
  useEffect(() => {
    if (id && id !== currentProblemId) {
      setCurrentProblemId(id);
    }
  }, [id, currentProblemId]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    const starter =
      currentProblem?.starterCode?.[newLang] ||
      getDefaultStarterCode(newLang, currentProblem?.title);
    setCode(starter);
    setCustomInput(currentProblem?.defaultInput?.[newLang] || "");
    setOutput(null);
    setTestResults(null);
  };

  const handleProblemChange = (newProblemId) => navigate(`/problem/${newProblemId}`);

  const triggerConfetti = () => {
    confetti({ particleCount: 80, spread: 250, origin: { x: 0.2, y: 0.6 } });
    confetti({ particleCount: 80, spread: 250, origin: { x: 0.8, y: 0.6 } });
  };

  const normalizeOutput = (output) =>
    output
      .trim()
      .split("\n")
      .map((line) =>
        line
          .trim()
          .replace(/\[\s+/g, "[")
          .replace(/\s+\]/g, "]")
          .replace(/\s*,\s*/g, ",")
      )
      .filter((line) => line.length > 0)
      .join("\n");

  const diffLines = (actual, expected) => {
    const a = actual.split("\n");
    const e = expected.split("\n");
    const max = Math.max(a.length, e.length);
    const diffs = [];
    for (let i = 0; i < max; i++) {
      const av = a[i] ?? "";
      const ev = e[i] ?? "";
      if (av !== ev) {
        diffs.push({ line: i + 1, actual: av, expected: ev });
      }
    }
    return diffs;
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    setTestResults(null);
    const result = await executeCode(selectedLanguage, code, customInput);
    setOutput(result);
    setIsRunning(false);

    if (result.success) {
      toast.success("Code executed successfully");
    } else {
      toast.error(`Execution failed: ${result.error || "unknown"}`);
    }
  };

  useEffect(() => {
    if (currentProblem) {
      setIsSolved(isProblemSolved(currentProblem));
    }
  }, [currentProblem]);

  useEffect(() => {
    const handleUpdate = () => {
      if (currentProblem) {
        setIsSolved(isProblemSolved(currentProblem));
      }
    };
    window.addEventListener("problem_solved_updated", handleUpdate);
    return () => window.removeEventListener("problem_solved_updated", handleUpdate);
  }, [currentProblem]);

  const handleSubmit = async () => {
    // Use aggregated expected output when available (Python data provides a single multiline string).
    const expectedAgg = currentProblem?.expectedOutput?.[selectedLanguage];
    if (expectedAgg) {
      setIsSubmitting(true);
      setTestResults(null);
      setOutput(null);
      const result = await executeCode(selectedLanguage, code);
      // Update output panel with aggregated execution result
      setOutput(result);
      const actualStr = result.output || "";
      const expectedStr = expectedAgg || "";
      const passed =
        result.success &&
        Boolean(actualStr.trim()) &&
        Boolean(expectedStr.trim()) &&
        normalizeOutput(actualStr) === normalizeOutput(expectedStr);
      const diffs = diffLines(normalizeOutput(actualStr), normalizeOutput(expectedStr));
      setTestResults([
        {
          input: "(aggregated)",
          expected: expectedAgg,
          actual: result.output,
          passed,
          diffs,
        },
      ]);
      setIsSubmitting(false);
      if (passed) {
        triggerConfetti();
        toast.success("Accepted! All test cases passed! 🎉");
        markProblemAsSolved(currentProblem);
        setIsSolved(true);
      } else {
        toast.error("Test case failed. See details below.");
      }
      return;
    }

    // Fallback: run each test case individually.
    let cases = currentProblem?.testCases;
    if (!cases?.length) {
      // Use examples as test cases if testCases not defined
      cases = currentProblem?.examples?.map((e) => ({ input: e.input, expectedOutput: e.output }));
    }
    if (!cases?.length) {
      toast.error("No test cases or examples defined for this problem. Running code directly...");
      await handleRunCode();
      return;
    }
    setIsSubmitting(true);
    setTestResults(null);
    setOutput(null);
    const results = [];
    for (const tc of cases) {
      const input = tc.input;
      const expected = tc.expectedOutput;
      const result = await executeCode(selectedLanguage, code, input);
      // Update output panel with latest execution result
      setOutput(result);

      const actualStr = result.output || "";
      const expectedStr = expected || "";
      const passed =
        result.success &&
        Boolean(actualStr.trim()) &&
        Boolean(expectedStr.trim()) &&
        normalizeOutput(actualStr) === normalizeOutput(expectedStr);

      results.push({
        input,
        expected,
        actual: result.output,
        passed,
        diffs: diffLines(normalizeOutput(actualStr), normalizeOutput(expectedStr)),
      });
    }
    setTestResults(results);
    setIsSubmitting(false);
    const allPass = results.length > 0 && results.every((r) => r.passed);
    if (allPass) {
      triggerConfetti();
      toast.success("Accepted! All test cases passed! 🎉");
      markProblemAsSolved(currentProblem);
      setIsSolved(true);
    } else {
      toast.error("Some test cases failed. See results below.");
    }
  };

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PanelGroup direction="horizontal">
          {/* left panel – problem description */}
          <Panel defaultSize={40} minSize={30}>
            <ProblemDescription
              problem={currentProblem}
              currentProblemId={currentProblemId}
              isSolved={isSolved}
              onProblemChange={handleProblemChange}
              allProblems={problemsData}
            />
          </Panel>
          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />
          {/* right panel – editor, input, output, test results */}
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical">
              {/* Top – Code editor */}
              <Panel defaultSize={55} minSize={30}>
                <CodeEditorPanel
                  selectedLanguage={selectedLanguage}
                  code={code}
                  isRunning={isRunning}
                  isSubmitting={isSubmitting}
                  isSolved={isSolved}
                  onLanguageChange={handleLanguageChange}
                  onCodeChange={setCode}
                  onRunCode={handleRunCode}
                  onSubmit={handleSubmit}
                />
                {/* Custom Input textarea */}
                <div className="p-4 border-t border-base-300 bg-base-200">
                  <h3 className="font-semibold mb-2">Standard Input</h3>
                  <textarea
                    className="textarea textarea-bordered w-full h-24"
                    placeholder="Enter custom input for your program"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                  />
                </div>
                {/* Action Buttons */}
                <div className="flex justify-end gap-2 p-4 bg-base-200 border-t border-base-300">
                  <button className="btn btn-primary btn-sm" onClick={handleSubmit}>Submit (All Tests)</button>
                </div>
              </Panel>
              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />
              {/* Bottom – Output & test results */}
              <Panel defaultSize={45} minSize={30}>
                <OutputPanel output={output} />
                {/* Test case result table */}
                {testResults && (
                  <div className="p-4 overflow-x-auto">
                    <h3 className="font-semibold mb-2">Test Results</h3>
                    <table className="table table-compact w-full">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Input</th>
                          <th>Expected</th>
                          <th>Actual</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testResults.map((r, idx) => (
                          <tr key={idx} className={r.passed ? "bg-success/10" : "bg-error/10"}>
                            <td>{idx + 1}</td>
                            <td><pre className="whitespace-pre-wrap text-xs">{r.input}</pre></td>
                            <td><pre className="whitespace-pre-wrap text-xs">{r.expected}</pre></td>
                            <td><pre className="whitespace-pre-wrap text-xs">{r.actual}</pre></td>
                            <td>{r.passed ? <span className="badge badge-success">Pass</span> : <span className="badge badge-error">Fail</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Diff details for failing cases */}
                    {testResults.some(r => !r.passed) && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Differences (for failed cases)</h4>
                        {testResults.map((r, idx) => !r.passed && (
                          <div key={idx} className="mb-2 p-2 border border-base-300 rounded">
                            <p className="font-semibold mb-1">Case {idx + 1}:</p>
                            {r.diffs.length === 0 ? (
                              <p className="text-sm text-base-content/70">(No line‑by‑line diff – possible whitespace differences)</p>
                            ) : (
                              <ul className="list-disc list-inside text-sm">
                                {r.diffs.map((d, di) => (
                                  <li key={di}>Line {d.line}: expected "{d.expected}" but got "{d.actual}"</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default ProblemPage;
