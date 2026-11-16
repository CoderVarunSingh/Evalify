import { useState, useEffect } from "react";
import { problemsData } from "../data/problemsData";
/**
 * Hook to fetch and filter problems from the mock data store.
 * Supports search, difficulty, category, company, language, round, and sorting.
 */
export function useProblems({ search = "", difficulty = "", category = "", company = "", language = "", round = "", sort = "" } = {}) {
  const [data, setData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      let filtered = problemsData;

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (p) => p.title.toLowerCase().includes(q) || (p.description?.text || "").toLowerCase().includes(q)
        );
      }
      if (difficulty) filtered = filtered.filter((p) => p.difficulty === difficulty);
      if (category) filtered = filtered.filter((p) => p.category === category);
      if (company) filtered = filtered.filter((p) => p.company === company);
      if (language) filtered = filtered.filter((p) => p.language === language);
      if (round) filtered = filtered.filter((p) => p.round === round);

      // Sorting options
      if (sort === "date") {
        filtered = filtered.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sort === "title") {
        filtered = filtered.slice().sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === "difficulty") {
        const order = { Easy: 0, Medium: 1, Hard: 2 };
        filtered = filtered.slice().sort((a, b) => order[a.difficulty] - order[b.difficulty]);
      }

      setData(filtered);
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  }, [search, difficulty, category, company, language, round, sort]);

  return { data, isLoading, error };
}


