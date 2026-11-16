import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useProblems } from "../hooks/useProblems";
import { ChevronRightIcon, Code2Icon, SearchIcon, FilterIcon, ArrowUpDownIcon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

function ProblemsPage() {
  // UI state for filters, search and sorting
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState("");
  const [company, setCompany] = useState("");
  const [language, setLanguage] = useState("");
  const [round, setRound] = useState("");
  const [sort, setSort] = useState("date"); // default newest first

  const { data: problems = [], isLoading, error } = useProblems({ search, difficulty, category, company, language, round, sort });

  // Compute distinct filter values from the full dataset (used for dropdown options)
  const allProblems = useMemo(() => problems, [problems]);
  const difficulties = useMemo(() => ["Easy", "Medium", "Hard"], []);
  const categories = useMemo(() => {
    const set = new Set();
    allProblems.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [allProblems]);
  const companies = useMemo(() => {
    const set = new Set();
    allProblems.forEach((p) => p.company && set.add(p.company));
    return Array.from(set);
  }, [allProblems]);
  const languages = useMemo(() => {
    const set = new Set();
    allProblems.forEach((p) => p.language && set.add(p.language));
    return Array.from(set);
  }, [allProblems]);
  const rounds = useMemo(() => {
    const set = new Set();
    allProblems.forEach((p) => p.round && set.add(p.round));
    return Array.from(set);
  }, [allProblems]);

  if (isLoading) return <div className="text-center py-8">Loading problems...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Failed to load problems.</div>;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Practice Problems</h1>
            <p className="text-base-content/70">Explore, filter, and solve thousands of curated coding challenges.</p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/50" />
              <input
                type="text"
                placeholder="Search by title or description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input input-sm w-full pl-10 bg-base-200 border-base-300 text-base-content"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="select select-sm bg-base-200 border-base-300 text-base-content"
            >
              <option value="date">Newest</option>
              <option value="title">Title (A‑Z)</option>
              <option value="difficulty">Difficulty</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="select select-sm bg-base-200 border-base-300 text-base-content"
          >
            <option value="">All Difficulties</option>
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="select select-sm bg-base-200 border-base-300 text-base-content"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="select select-sm bg-base-200 border-base-300 text-base-content"
          >
            <option value="">All Companies</option>
            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
                    <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="select select-sm bg-base-200 border-base-300 text-base-content"
          >
            <option value="">All Languages</option>
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {/* Round Filter */}
          <select
            value={round}
            onChange={(e) => setRound(e.target.value)}
            className="select select-sm bg-base-200 border-base-300 text-base-content"
          >
            <option value="">All Rounds</option>
            {rounds.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearch("");
              setDifficulty("");
              setCategory("");
              setCompany("");
              setLanguage("");
              setSort("date");
            }}
            className="btn btn-outline btn-sm"
          >
            <FilterIcon className="w-4 h-4" /> Reset
          </button>
        </div>

        {/* Problems List */}
        <div className="space-y-3">
          {problems.map((problem, idx) => (
            <Link
              key={problem._id}
              to={`/problem/${problem._id}`}
              className="card bg-base-100 hover:scale-[1.01] transition-transform"
            >
              <div className="card-body flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 flex items-start md:items-center gap-4">
                  <div className="text-sm font-mono text-base-content/50">{idx + 1}.</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold">{problem.title}</h2>
                      <span className={`badge ${getDifficultyBadgeClass(problem.difficulty)}`}>{problem.difficulty}</span>
                    </div>
                    <p className="text-sm text-base-content/60">{problem.description?.text}</p>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      <span className="badge badge-outline badge-primary">{problem.category}</span>
                      <span className="badge badge-outline badge-secondary">{problem.company}</span>
                      <span className="badge badge-outline badge-accent">{problem.language}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <span className="font-medium">Solve</span>
                  <ChevronRightIcon className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="mt-12 card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="stats stats-vertical lg:stats-horizontal">
              <div className="stat">
                <div className="stat-title">Total Problems</div>
                <div className="stat-value text-primary">{problems.length}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Easy</div>
                <div className="stat-value text-success">{problems.filter((p) => p.difficulty === "Easy").length}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Medium</div>
                <div className="stat-value text-warning">{problems.filter((p) => p.difficulty === "Medium").length}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Hard</div>
                <div className="stat-value text-error">{problems.filter((p) => p.difficulty === "Hard").length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemsPage;
