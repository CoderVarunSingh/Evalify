import express from "express";
import { execFile } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

const router = express.Router();

const JUDGE0_LANGUAGE_MAP = {
  javascript: 93, // Node.js 18.15.0
  js: 93,
  python: 71,     // Python 3.8.1
  python3: 71,
  py: 71,
  java: 91,       // Java JDK 17.0.6
  c: 103,         // C (GCC 14.1.0)
  cpp: 105,       // C++ (GCC 14.1.0)
  "c++": 105,
  go: 95,         // Go (1.18.5)
  rust: 108,      // Rust (1.85.0)
  rs: 108,
  kotlin: 111,    // Kotlin (2.1.10)
  kt: 111,
  csharp: 51,     // C# (Mono 6.6.0.161)
  "c#": 51,
  cs: 51,
  sql: 82,        // SQL (SQLite 3.27.2)
  typescript: 101,// TypeScript (5.6.2)
  ts: 101,
  bash: 46,       // Bash
};

async function executeLocally(language, code, stdin) {
  const lang = (language || "").toLowerCase();
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "tiq-exec-"));
  try {
    let cmd = "";
    let args = [];
    let filename = "";

    if (lang === "python" || lang === "python3" || lang === "py") {
      cmd = "python";
      filename = path.join(tempDir, "script.py");
      await fs.writeFile(filename, code, "utf-8");
      args = [filename];
    } else if (lang === "javascript" || lang === "js" || lang === "node") {
      cmd = "node";
      filename = path.join(tempDir, "script.js");
      await fs.writeFile(filename, code, "utf-8");
      args = [filename];
    } else {
      throw new Error(`Local execution not supported for ${language}`);
    }

    return new Promise((resolve) => {
      const proc = execFile(cmd, args, { timeout: 10000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        const out = (stdout || "").toString();
        let err = (stderr || "").toString();
        if (error && !err) {
          err = error.message;
        }
        resolve({
          run: {
            stdout: out,
            stderr: err.trim(),
            output: (out + (err ? `\n${err}` : "")).trim() || "No output",
            code: error ? (error.code || 1) : 0,
          },
        });
      });

      if (stdin && proc.stdin) {
        proc.stdin.write(stdin);
        proc.stdin.end();
      }
    });
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

async function executeWithJudge0(language, code, stdin) {
  const langKey = (language || "").toLowerCase();
  const langId = JUDGE0_LANGUAGE_MAP[langKey];
  if (!langId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const response = await fetch("https://ce.judge0.com/submissions?wait=true", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source_code: code,
      language_id: langId,
      stdin: stdin || "",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Judge0 API error (${response.status}): ${text}`);
  }

  const data = await response.json();
  const stdout = data.stdout || "";
  let stderr = data.stderr || "";
  if (data.compile_output) {
    stderr = (stderr ? `${stderr}\n` : "") + data.compile_output;
  }
  if (data.message) {
    stderr = (stderr ? `${stderr}\n` : "") + data.message;
  }

  const output = (stdout + (stderr ? `\n${stderr}` : "")).trim() || "No output";
  const codeExit = data.status?.id === 3 ? 0 : 1;

  return {
    run: {
      stdout,
      stderr: stderr.trim(),
      output,
      code: codeExit,
    },
  };
}

// POST /api/piston/execute
router.post("/execute", async (req, res) => {
  try {
    const { language, files, stdin, code: directCode } = req.body;
    const code = (files && files[0] && files[0].content) || directCode || "";

    if (!code) {
      return res.status(200).json({
        run: {
          stdout: "",
          stderr: "No code provided to execute",
          output: "No code provided to execute",
          code: 1,
        },
      });
    }

    // 1. Try Judge0 execution engine (supports Python, Java, C, C++, Go, Rust, Kotlin, C#, SQL)
    try {
      const result = await executeWithJudge0(language, code, stdin);
      return res.status(200).json(result);
    } catch (judge0Err) {
      console.warn("Judge0 execution failed, attempting local fallback:", judge0Err.message);

      // 2. Try local execution fallback (Python / Node.js)
      try {
        const localResult = await executeLocally(language, code, stdin);
        return res.status(200).json(localResult);
      } catch (localErr) {
        return res.status(200).json({
          run: {
            stdout: "",
            stderr: `Execution error: ${judge0Err.message}`,
            output: `Execution error: ${judge0Err.message}`,
            code: 1,
          },
        });
      }
    }
  } catch (err) {
    console.error("Error in piston execute:", err);
    return res.status(500).json({
      run: {
        stdout: "",
        stderr: err.message,
        output: `Server error: ${err.message}`,
        code: 1,
      },
    });
  }
});

export default router;
