"use client";

import { CheckCircle2 } from "lucide-react";

export default function DifficultyBadge({ difficulty, onDifficultyChange }) {
  const levels = ["easy", "medium", "hard"];
  const labels = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  };

  return (
    <div className="space-y-3">
      {/* Difficulty Buttons */}
      <div className="flex gap-2" role="group" aria-label="Select difficulty level">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => onDifficultyChange(level)}
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              difficulty === level
                ? "bg-blue-500 text-white shadow-md"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
            aria-pressed={difficulty === level}
          >
            {difficulty === level && <CheckCircle2 size={16} aria-hidden="true" />}
            {labels[level]}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div
        className="relative h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-4"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={levels.length}
        aria-valuenow={levels.indexOf(difficulty) + 1}
        aria-label={`Difficulty progress: ${labels[difficulty]}`}
      >
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 transition-all duration-300"
          style={{
            width: `${((levels.indexOf(difficulty) + 1) / levels.length) * 100}%`,
          }}
        />
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
        Current: {labels[difficulty]}
      </p>
    </div>
  );
}
