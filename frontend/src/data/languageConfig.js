// src/data/languageConfig.js
// Configuration for supported programming languages.
// Provides display name, monaco language identifier, icon path, and piston execution details.

export const LANGUAGE_CONFIG = {
  javascript: {
    name: "JavaScript",
    monacoLang: "javascript",
    icon: "/icons/js.svg",
    piston: { language: "javascript", version: "18.15.0" },
  },
  python: {
    name: "Python",
    monacoLang: "python",
    icon: "/icons/python.svg",
    piston: { language: "python", version: "3.10.0" },
  },
  java: {
    name: "Java",
    monacoLang: "java",
    icon: "/icons/java.svg",
    piston: { language: "java", version: "15.0.2" },
  },
  c: {
    name: "C",
    monacoLang: "c",
    icon: "/icons/c.svg",
    piston: { language: "c", version: "10.2.0" },
  },
  cpp: {
    name: "C++",
    monacoLang: "cpp",
    icon: "/icons/cpp.svg",
    piston: { language: "cpp", version: "10.2.0" },
  },
  go: {
    name: "Go",
    monacoLang: "go",
    icon: "/icons/go.svg",
    piston: { language: "go", version: "1.21.0" },
  },
  rust: {
    name: "Rust",
    monacoLang: "rust",
    icon: "/icons/rust.svg",
    piston: { language: "rust", version: "1.71.0" },
  },
  kotlin: {
    name: "Kotlin",
    monacoLang: "kotlin",
    icon: "/icons/kotlin.svg",
    piston: { language: "kotlin", version: "1.8.0" },
  },
  csharp: {
    name: "C#",
    monacoLang: "csharp",
    icon: "/icons/csharp.svg",
    piston: { language: "csharp", version: "11.0.0" },
  },
  sql: {
    name: "SQL",
    monacoLang: "sql",
    icon: "/icons/sql.svg",
    piston: { language: "sql", version: "5.7" },
  },
};
