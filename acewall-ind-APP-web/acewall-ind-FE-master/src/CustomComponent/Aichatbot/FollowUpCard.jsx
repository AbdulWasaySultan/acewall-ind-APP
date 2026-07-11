"use client";

export default function FollowUpCard({ questions, onSelectQuestion }) {
  return (
    <div
      className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700"
      role="region"
      aria-label="Practice Questions"
    >
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
        Practice Questions
      </h3>

      <div className="space-y-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelectQuestion(question)}
            className="w-full text-left px-3 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Select practice question: ${question}`}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
