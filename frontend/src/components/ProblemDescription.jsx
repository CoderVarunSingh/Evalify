import { getDifficultyBadgeClass } from "../lib/utils";
import { CheckCircle2Icon, ChevronDownIcon } from "lucide-react";
import { isProblemSolved } from "../lib/solvedStorage";

function ProblemDescription({ problem, currentProblemId, isSolved, onProblemChange, allProblems }) {
  return (
    <div className="h-full overflow-y-auto bg-base-200">
      {/* HEADER SECTION */}
      <div className="p-6 bg-base-100 border-b border-base-300">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-3xl font-bold text-base-content">{problem.title}</h1>
            {isSolved && (
              <span className="badge badge-success text-white badge-sm gap-1 py-2 px-2.5 shadow-sm font-semibold">
                <CheckCircle2Icon className="w-4 h-4" /> Solved
              </span>
            )}
          </div>
          <span className={`badge ${getDifficultyBadgeClass(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
        </div>
        <p className="text-base-content/60">{problem.category}</p>

        {/* Custom Problem selector dropdown */}
        <div className="mt-4 relative dropdown w-full">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-sm h-auto py-2.5 px-4.5 w-full justify-between bg-base-100 border-base-300 font-normal text-sm normal-case shadow-sm"
          >
            <span className="flex items-center gap-2 truncate">
              {isSolved && <span className="text-success font-bold">✓</span>}
              <span className="font-semibold">{problem.title}</span>
              <span className={`badge badge-sm ${getDifficultyBadgeClass(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
            </span>
            <ChevronDownIcon className="w-4 h-4 opacity-60 shrink-0 ml-2" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow-2xl bg-base-100 rounded-2xl w-full left-0 right-0 min-w-full mt-1.5 border border-base-300 z-50 max-h-80 overflow-y-auto flex-nowrap space-y-1"
          >
            {allProblems.map((p, idx) => {
              const solved = isProblemSolved(p);
              const isSelected = (p._id || p.id) === currentProblemId || p.title === problem.title;
              return (
                <li key={p._id || p.id || idx}>
                  <button
                    type="button"
                    onClick={() => {
                      onProblemChange(p._id || p.id);
                      if (document.activeElement) document.activeElement.blur();
                    }}
                    className={`flex items-center justify-between text-sm py-2.5 px-3.5 rounded-xl transition-all ${
                      isSelected
                        ? "bg-primary/10 font-bold text-primary"
                        : "hover:bg-base-200/80 text-base-content"
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      {solved ? (
                        <span className="text-success font-bold text-base">✓</span>
                      ) : (
                        <span className="w-4 inline-block"></span>
                      )}
                      <span>{p.title}</span>
                    </span>
                    <span className={`badge badge-sm shrink-0 ${getDifficultyBadgeClass(p.difficulty)}`}>
                      {p.difficulty}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* PROBLEM DESC */}
        <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
          <h2 className="text-xl font-bold text-base-content">Description</h2>

          <div className="space-y-3 text-base leading-relaxed">
            <p className="text-base-content/90">{problem.description?.text}</p>
            {problem.description?.notes?.map((note, idx) => (
              <p key={idx} className="text-base-content/90">
                {note}
              </p>
            ))}
          </div>
        </div>

        {/* EXAMPLES SECTION */}
        <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
          <h2 className="text-xl font-bold mb-4 text-base-content">Examples</h2>
          <div className="space-y-4">
            {problem.examples?.map((example, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-sm">{idx + 1}</span>
                  <p className="font-semibold text-base-content">Example {idx + 1}</p>
                </div>
                <div className="bg-base-200 rounded-lg p-4 font-mono text-sm space-y-1.5">
                  <div className="flex gap-2">
                    <span className="text-primary font-bold min-w-[70px]">Input:</span>
                    <span>{example.input}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-secondary font-bold min-w-[70px]">Output:</span>
                    <span>{example.output}</span>
                  </div>
                  {example.explanation && (
                    <div className="pt-2 border-t border-base-300 mt-2">
                      <span className="text-base-content/60 font-sans text-xs">
                        <span className="font-semibold">Explanation:</span> {example.explanation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONSTRAINTS */}
        <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
          <h2 className="text-xl font-bold mb-4 text-base-content">Constraints</h2>
          <ul className="space-y-2 text-base-content/90">
            {problem.constraints?.map((constraint, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-primary">•</span>
                <code className="text-sm">{constraint}</code>
              </li>
            ))}
          </ul>
        </div>

        {/* TEST CASES SECTION */}
        {Boolean((problem.testCases || problem.examples)?.length) && (
          <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
            <h2 className="text-xl font-bold mb-4 text-base-content">Test Cases</h2>
            <div className="space-y-4">
              {(problem.testCases || problem.examples.map(e => ({ input: e.input, expectedOutput: e.output }))).map((tc, idx) => (
                <div key={idx} className="bg-base-200 rounded-lg p-4 font-mono text-sm space-y-1.5">
                  <div className="flex gap-2">
                    <span className="text-primary font-bold min-w-[70px]">Input:</span>
                    <span>{tc.input}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-secondary font-bold min-w-[70px]">Expected:</span>
                    <span>{tc.expectedOutput}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProblemDescription;
