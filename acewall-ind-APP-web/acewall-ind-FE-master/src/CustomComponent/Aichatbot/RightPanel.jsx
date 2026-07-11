"use client";

import { useState } from "react";
import DifficultyBadge from "./DifficultyBadge";
import FollowUpCard from "./FollowUpCard";
import ExportButtons from "./ExportButtons";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function RightPanel({
  difficulty,
  onDifficultyChange,
  onFollowUpQuestion,
  onDownloadPDF,
  onDownloadWord,
  suggestions = [], // ✅ Accept dynamic suggestions from parent
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors duration-200 z-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Expand study tools panel"
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </button>
    );
  }

  return (
    <aside
      className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col overflow-y-auto"
      role="complementary"
      aria-label="Study tools panel"
    >
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Study Tools
        </h2>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Collapse study tools panel"
        >
          <ChevronRight
            size={20}
            className="text-slate-600 dark:text-slate-400"
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-6 px-4 py-6">
        {/* Difficulty Badge */}
        <section aria-labelledby="difficulty-heading">
          <h3
            id="difficulty-heading"
            className="text-sm font-semibold text-slate-900 dark:text-white mb-3"
          >
            Difficulty Level
          </h3>
          <DifficultyBadge
            difficulty={difficulty}
            onDifficultyChange={onDifficultyChange}
          />
        </section>

        {/* Follow-up / Suggested Questions */}
        <section
          aria-labelledby="followup-heading"
          className={`${
            suggestions.length <= 0 && "pointer-events-none opacity-50"
          }`}
        >
          <h3 id="followup-heading" className="sr-only">
            Follow-up Questions
          </h3>
          <FollowUpCard
            questions={
              suggestions.length > 0
                ? suggestions
                : ["Ask a question to see suggestions!"]
            }
            onSelectQuestion={onFollowUpQuestion}
          />
        </section>

        {/* Export Buttons */}
        <section aria-labelledby="export-heading">
          <h3 id="export-heading" className="sr-only">
            Export Options
          </h3>
          <ExportButtons
            onDownloadPDF={onDownloadPDF}
            onDownloadWord={onDownloadWord}
          />
        </section>
      </div>
    </aside>
  );
}
