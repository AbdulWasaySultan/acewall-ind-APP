import React, { useMemo } from "react";
import { format } from "date-fns";
import { X } from "lucide-react"; // modern minimal icon

const MotivationToast = ({ pendingCount, nearestDueDate, onClose }) => {
  // 1. Define quotes tailored specifically for the Assessment page
  const academicQuotes = [
    "Assessments are steps toward mastery. Keep climbing!",
    "Your focus determines your reality. Finish strong!",
    "Great things never come from comfort zones. Tackle that next task!",
    "Success is the sum of small assignments repeated day in and day out.",
    "Every assessment you complete is a piece of your future.",
    "Don't study to clear a test, study to understand the world.",
    "The secret to getting ahead is getting started. Which one is next?",
    "Mistakes in practice assessments are just lessons in disguise.",
    "Believe in your prep. You are more capable than you think.",
    "Your future self will thank you for the work you do today."
  ];

  // 2. Randomly select a quote for this specific toast instance
  const randomQuote = useMemo(() => {
    return academicQuotes[Math.floor(Math.random() * academicQuotes.length)];
  }, []);

  return (
    <div
      className="relative w-80 p-4 rounded-xl shadow-lg bg-gradient-to-br from-blue-50 to-green-50 
                 border border-blue-100 animate-in fade-in slide-in-from-right-5 duration-300"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded-md hover:bg-gray-200 transition"
        aria-label="Close notification"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>

      <div className="flex items-start gap-3">
        <div className="text-3xl">{pendingCount === 0 ? "🏆" : "🌟"}</div>

        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-lg">
            {pendingCount === 0 ? "All Caught Up!" : "Keep Going!"}
          </p>

          <p className="text-sm text-gray-700 mt-1">
            {pendingCount > 0 ? (
              <>
                You have{" "}
                <span className="font-semibold text-blue-700">
                  {pendingCount} pending assessment
                  {pendingCount !== 1 ? "s" : ""}
                </span>
                {nearestDueDate && (
                  <>
                    <br />
                    Next due on{" "}
                    <span className="font-medium text-green-700">
                      {format(nearestDueDate, "MMM dd, yyyy")}
                    </span>
                  </>
                )}
              </>
            ) : (
              "You have completed all your tasks for now!"
            )}
          </p>

          {/* Dynamic Motivational Quote */}
          <p className="text-xs text-gray-500 mt-2 italic">
            {randomQuote} 💪
          </p>

          {/* progress bar */}
          <div className="w-full bg-gray-200 h-1 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 animate-progressBar"
              style={{
                width: '100%',
                animation: 'progressBar 5s linear forwards'
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotivationToast;