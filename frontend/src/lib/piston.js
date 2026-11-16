import axiosInstance from "./axios.js";


const LANGUAGE_VERSIONS = {
  javascript: { language: "javascript", version: "18.15.0", ext: "js" },
  python: { language: "python", version: "3.10.0", ext: "py" },
  java: { language: "java", version: "15.0.2", ext: "java" },
  c: { language: "c", version: "10.2.0", ext: "c" },
  cpp: { language: "cpp", version: "10.2.0", ext: "cpp" },
  go: { language: "go", version: "1.21.0", ext: "go" },
  rust: { language: "rust", version: "1.71.0", ext: "rs" },
  kotlin: { language: "kotlin", version: "1.9.0", ext: "kt" },
  csharp: { language: "csharp", version: "12.0.0", ext: "cs" },
  sql: { language: "sql", version: "latest", ext: "sql" },
};

/**
 * @param {string} language - programming language
 * @param {string} code - source code to executed
 * @returns {Promise<{success:boolean, output?:string, error?: string}>}
 */
export async function executeCode(language, code, stdin = "") {
  try {
    // For JavaScript, execute in browser sandbox for 100% reliable execution
    if (language === "javascript") {
      try {
        let logs = [];
        const customConsole = {
          log: (...args) => logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
          error: (...args) => logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
          info: (...args) => logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
        };
        const runFn = new Function("console", code);
        const retVal = runFn(customConsole);
        let outputText = logs.join("\n");
        if (retVal !== undefined && (!outputText || !outputText.includes(JSON.stringify(retVal)))) {
          if (outputText) outputText += "\n";
          outputText += typeof retVal === "object" ? JSON.stringify(retVal) : String(retVal);
        }
        if (!outputText) {
          outputText = "Program executed successfully with no output.\n(Tip: Use console.log(...) to print your results or call your function)";
        }
        return { success: true, output: outputText };
      } catch (evalErr) {
        return { success: false, output: "", error: evalErr.message };
      }
    }

    const languageConfig = LANGUAGE_VERSIONS[language];
    if (!languageConfig) {
      return { success: false, error: `Unsupported language: ${language}` };
    }

    try {
      const { data } = await axiosInstance.post("/piston/execute", {
        language: languageConfig.language,
        version: languageConfig.version,
        files: [{ name: `main.${languageConfig.ext || getFileExtension(language)}`, content: code }],
        stdin: stdin,
      });

      const output = data.run?.output || "";
      const stderr = data.run?.stderr || "";
      if (stderr) {
        return { success: false, output: output, error: stderr };
      }
      return { 
        success: true, 
        output: output || "Program executed successfully with no output.\n(Tip: Use print(...) in Python or console.log(...) in JavaScript to print output)" 
      };
    } catch (err) {
      const errorMsg = err.response?.data?.run?.stderr || err.response?.data?.message || err.message;
      return { success: false, error: errorMsg };
    }
  } catch (error) {
    return { success: false, error: `Failed to execute code: ${error.message}` };
  }
}

function getFileExtension(language) {
  const extensions = {
    javascript: "js",
    python: "py",
    java: "java",
  };
  return extensions[language] || "txt";
}
