import React, { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";
import { PROBLEMS } from "../data/problems";
import { problemsData } from "../data/problemsData";
import { getSolvedProblems } from "../lib/solvedStorage";
import { getDifficultyBadgeClass } from "../lib/utils";
import {
  ListChecksIcon,
  PlusIcon,
  CheckCircle2Icon,
  Trash2Icon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BookOpenIcon,
} from "lucide-react";

function RevisionLists() {
  const [lists, setLists] = useLocalStorage("iq_revisionLists", {
    "Blind 75 Essentials": ["prob-001", "prob-005", "reverse-string", "valid-palindrome"],
    "Dynamic Programming & Arrays": ["prob-001", "prob-008", "prob-011", "container-with-most-water"],
    "High Frequency Company Prep": ["prob-002", "prob-003", "prob-006", "prob-013"],
  });

  const [newListTitle, setNewListTitle] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedList, setExpandedList] = useState("Blind 75 Essentials");
  const navigate = useNavigate();

  const solvedSet = new Set(getSolvedProblems());

  const getProblemInfo = (id) => {
    const pData = problemsData.find((p) => p._id === id || p.id === id);
    const pRich = Object.values(PROBLEMS).find((p) => p._id === id || p.id === id || p.title === id);
    return {
      id: pData?._id || pRich?.id || id,
      title: pRich?.title || pData?.title || id,
      difficulty: pRich?.difficulty || pData?.difficulty || "Easy",
    };
  };

  const handleCreateList = (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    setLists({
      ...lists,
      [newListTitle.trim()]: ["prob-001", "valid-palindrome"],
    });
    setNewListTitle("");
    setShowCreateModal(false);
  };

  const handleDeleteList = (name) => {
    if (window.confirm(`Delete revision list "${name}"?`)) {
      const updated = { ...lists };
      delete updated[name];
      setLists(updated);
    }
  };

  const listNames = Object.keys(lists);

  return (
    <div className="bg-base-100 rounded-3xl p-6 border border-base-300 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-300 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-secondary/10 text-secondary">
            <ListChecksIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Revision Lists
              <span className="badge badge-secondary badge-sm font-mono">{listNames.length} Lists</span>
            </h2>
            <p className="text-xs text-base-content/60">Curated study lists for technical interview prep</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-sm btn-secondary gap-1.5 rounded-xl text-xs font-bold"
        >
          <PlusIcon className="w-4 h-4" /> Create Custom List
        </button>
      </div>

      {/* Modal to create new list */}
      {showCreateModal && (
        <div className="p-4 bg-secondary/10 border border-secondary/30 rounded-2xl animate-in fade-in">
          <form onSubmit={handleCreateList} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Meta Final Round Prep, Tree Traversal Mastery..."
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              className="input input-sm input-bordered flex-1 bg-base-100 text-sm"
              autoFocus
            />
            <button type="submit" className="btn btn-sm btn-secondary font-bold">
              Save List
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="btn btn-sm btn-ghost"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {listNames.length === 0 ? (
        <div className="text-center py-10 bg-base-200/40 rounded-2xl border border-dashed border-base-300">
          <ListChecksIcon className="w-10 h-10 mx-auto text-base-content/30 mb-2" />
          <p className="font-semibold text-base-content/70">No revision lists available.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listNames.map((name) => {
            const probIds = lists[name] || [];
            const solvedCount = probIds.filter((id) => solvedSet.has(id)).length;
            const progress = probIds.length > 0 ? Math.round((solvedCount / probIds.length) * 100) : 0;
            const isExpanded = expandedList === name;

            return (
              <div key={name} className="border border-base-300 rounded-2xl overflow-hidden bg-base-200/30">
                <div
                  onClick={() => setExpandedList(isExpanded ? null : name)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-base-200/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <BookOpenIcon className="w-5 h-5 text-secondary shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-base-content truncate">{name}</span>
                        <span className="badge badge-ghost badge-xs font-mono">{probIds.length} Problems</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 bg-base-300 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-secondary h-1.5 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono text-base-content/60">
                          {solvedCount}/{probIds.length} ({progress}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteList(name);
                      }}
                      className="btn btn-ghost btn-xs text-error hover:bg-error/10 p-1 rounded-lg"
                      title="Delete List"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                    {isExpanded ? (
                      <ChevronUpIcon className="w-5 h-5 opacity-60" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 opacity-60" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-3 bg-base-100 border-t border-base-300 space-y-2">
                    {probIds.map((id) => {
                      const prob = getProblemInfo(id);
                      const isSolved = solvedSet.has(id);

                      return (
                        <div
                          key={id}
                          onClick={() => navigate(`/problem/${prob.id}`)}
                          className="flex items-center justify-between p-3 rounded-xl bg-base-200/50 hover:bg-base-200 border border-base-300/60 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            {isSolved ? (
                              <CheckCircle2Icon className="w-4 h-4 text-success shrink-0" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border-2 border-base-300 shrink-0"></span>
                            )}
                            <span className="text-xs font-semibold text-base-content truncate group-hover:text-primary transition-colors">
                              {prob.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`badge badge-xs shrink-0 ${getDifficultyBadgeClass(prob.difficulty)}`}>
                              {prob.difficulty}
                            </span>
                            <ArrowRightIcon className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RevisionLists;
