const STORAGE_KEY = "evalify_solved_problems";
const LEGACY_STORAGE_KEY = "talent_iq_solved_problems";

// Known valid problem IDs to filter out any corrupted or legacy strings from localStorage
const VALID_IDS = new Set([
  "prob-001", "two-sum",
  "prob-002", "add-two-numbers",
  "prob-003", "longest-substring-without-repeating-characters",
  "prob-004", "median-of-two-sorted-arrays",
  "prob-005", "valid-parentheses",
  "prob-006", "find-the-duplicate-number",
  "prob-007", "reverse-linked-list",
  "prob-008", "maximum-subarray",
  "prob-009", "binary-tree-level-order-traversal",
  "prob-010", "string-to-integer-atoi",
  "prob-011", "merge-intervals",
  "prob-012", "rotate-image",
  "prob-013", "lru-cache",
  "prob-014", "find-all-anagrams-in-a-string",
  "reverse-string",
  "valid-palindrome",
  "container-with-most-water",
]);

export function getSolvedProblems() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY) || "[]";
    const raw = JSON.parse(rawData);
    if (!Array.isArray(raw)) return [];
    // Only return non-empty strings that are valid problem IDs
    return raw.filter((item) => typeof item === "string" && item.trim().length > 0 && VALID_IDS.has(item.trim()));
  } catch {
    return [];
  }
}

export function markProblemAsSolved(problemOrId) {
  try {
    const solved = getSolvedProblems();
    const toAdd = [];

    if (typeof problemOrId === "string" && problemOrId.trim()) {
      toAdd.push(problemOrId.trim());
    } else if (problemOrId && typeof problemOrId === "object") {
      if (problemOrId._id) toAdd.push(problemOrId._id);
      if (problemOrId.id) toAdd.push(problemOrId.id);
    }

    let changed = false;
    for (const item of toAdd) {
      if (item && typeof item === "string" && VALID_IDS.has(item) && !solved.includes(item)) {
        solved.push(item);
        changed = true;
      }
    }

    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(solved));
      window.dispatchEvent(new Event("problem_solved_updated"));
    }
  } catch (err) {
    console.error("Error saving solved problem:", err);
  }
}

export function isProblemSolved(problemOrId) {
  try {
    const solved = getSolvedProblems();
    if (!problemOrId || solved.length === 0) return false;

    if (typeof problemOrId === "string") {
      const idStr = problemOrId.trim();
      return solved.includes(idStr);
    }

    if (typeof problemOrId === "object") {
      if (problemOrId._id && solved.includes(problemOrId._id)) return true;
      if (problemOrId.id && solved.includes(problemOrId.id)) return true;
    }

    return false;
  } catch {
    return false;
  }
}

export function clearSolvedProblems() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("problem_solved_updated"));
  } catch (err) {
    console.error("Error clearing solved problems:", err);
  }
}
