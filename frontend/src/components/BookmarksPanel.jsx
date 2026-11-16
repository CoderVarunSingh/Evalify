import React from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";
import { PROBLEMS } from "../data/problems";
import { problemsData } from "../data/problemsData";
import { BookmarkIcon, Trash2Icon, ArrowRightIcon, BookOpenIcon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

function BookmarksPanel() {
  const [bookmarks, setBookmarks] = useLocalStorage("iq_bookmarks", []);
  const navigate = useNavigate();

  const removeBookmark = (e, id) => {
    e.stopPropagation();
    setBookmarks(bookmarks.filter((b) => b !== id));
  };

  const getProblemInfo = (id) => {
    const pData = problemsData.find((p) => p._id === id || p.id === id);
    const pRich = Object.values(PROBLEMS).find((p) => p._id === id || p.id === id || p.title === id);
    return {
      id: pData?._id || pRich?.id || id,
      title: pRich?.title || pData?.title || id,
      difficulty: pRich?.difficulty || pData?.difficulty || "Easy",
      category: pRich?.category || pData?.category || "General",
      description: pRich?.description?.text || pData?.description?.text || "",
    };
  };

  return (
    <div className="bg-base-100 rounded-3xl p-6 border border-base-300 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-base-300 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-warning/10 text-warning">
            <BookmarkIcon className="w-5 h-5 fill-warning" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Bookmarked Problems
              <span className="badge badge-warning badge-sm font-mono">{bookmarks.length} Saved</span>
            </h2>
            <p className="text-xs text-base-content/60">Quick access to challenges saved for later</p>
          </div>
        </div>

        {bookmarks.length > 0 && (
          <button
            onClick={() => navigate("/problems")}
            className="btn btn-ghost btn-xs text-primary font-bold"
          >
            Browse All Problems
          </button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-10 bg-base-200/40 rounded-2xl border border-dashed border-base-300 space-y-3">
          <BookmarkIcon className="w-10 h-10 mx-auto text-base-content/30" />
          <p className="font-semibold text-base-content/70">No bookmarked problems yet.</p>
          <p className="text-xs text-base-content/50 max-w-sm mx-auto">
            Bookmark tricky questions while practicing to save them here for quick review!
          </p>
          <button onClick={() => navigate("/problems")} className="btn btn-sm btn-primary rounded-xl text-xs">
            <BookOpenIcon className="w-4 h-4" /> Explore Problems
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bookmarks.map((id) => {
            const prob = getProblemInfo(id);
            return (
              <div
                key={id}
                onClick={() => navigate(`/problem/${prob.id}`)}
                className="flex items-center justify-between p-4 rounded-2xl bg-base-200/50 hover:bg-base-200 border border-base-300 transition-all cursor-pointer group"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-base-content truncate group-hover:text-primary transition-colors">
                      {prob.title}
                    </span>
                    <span className={`badge badge-xs ${getDifficultyBadgeClass(prob.difficulty)}`}>
                      {prob.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-base-content/60 line-clamp-1">{prob.description || prob.category}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => removeBookmark(e, id)}
                    className="btn btn-ghost btn-xs text-error hover:bg-error/10 rounded-lg p-1"
                    title="Remove Bookmark"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                  <div className="btn btn-primary btn-xs rounded-lg gap-1">
                    <span>Solve</span>
                    <ArrowRightIcon className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BookmarksPanel;
