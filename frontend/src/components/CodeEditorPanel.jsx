// CodeEditorPanel component - cleaned duplicate definitions
import Editor from "@monaco-editor/react";
import { Loader2Icon, PlayIcon, MoonIcon, SunIcon, SendIcon, CheckCircle2Icon } from "lucide-react";
import { LANGUAGE_CONFIG } from "../data/languageConfig";
import React from "react";

function CodeEditorPanel({
  selectedLanguage,
  code,
  isRunning,
  isSubmitting,
  isSolved,
  onLanguageChange,
  onCodeChange,
  onRunCode,
  onSubmit,
}) {
  const [theme, setTheme] = React.useState("vs-dark");

  const toggleTheme = () =>
    setTheme((prev) => (prev === "vs-dark" ? "vs-light" : "vs-dark"));

  return (
    <div className="h-full bg-base-300 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-base-100 border-t border-base-300">
        <div className="flex items-center gap-3">
          <img
            src={LANGUAGE_CONFIG[selectedLanguage].icon}
            alt={LANGUAGE_CONFIG[selectedLanguage].name}
            className="size-6"
          />
          <select className="select select-sm" value={selectedLanguage} onChange={onLanguageChange}>
            {Object.entries(LANGUAGE_CONFIG).map(([key, lang]) => (
              <option key={key} value={key}>
                {lang.name}
              </option>
            ))}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={toggleTheme} title="Toggle theme">
            {theme === "vs-dark" ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isSolved && (
            <span className="badge badge-success text-white badge-sm gap-1 font-semibold py-2 px-2.5 shadow-sm">
              <CheckCircle2Icon className="w-3.5 h-3.5" /> Solved
            </span>
          )}

          <button
            className="btn btn-outline btn-sm gap-1.5"
            disabled={isRunning || isSubmitting}
            onClick={onRunCode}
          >
            {isRunning ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <PlayIcon className="size-4" />
                Run
              </>
            )}
          </button>

          <button
            className="btn btn-success text-white btn-sm gap-1.5 shadow-sm hover:opacity-95"
            disabled={isRunning || isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <SendIcon className="size-4" />
                Submit
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1">
        <Editor
          height={"100%"}
          language={LANGUAGE_CONFIG[selectedLanguage].monacoLang}
          value={code}
          onChange={onCodeChange}
          theme={theme}
          options={{
            fontSize: 16,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: false },
          }}
        />
      </div>
    </div>
  );
}

export default CodeEditorPanel;
