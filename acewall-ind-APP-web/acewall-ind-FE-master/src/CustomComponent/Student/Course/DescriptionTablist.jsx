import { TabsContent } from "@/components/ui/tabs";
import React from "react";

const DescriptionTablist = ({
  chapter,
  activeLesson,
  isLessonVisible,
  toggleLessonVisibility,
}) => {
  return (
    <TabsContent
      value="description"
      className="p-6 bg-white rounded-lg shadow-md"
    >
      <div className="space-y-6">
        {/* Chapter Title and Description */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            {chapter.title}
          </h3>
          <p className="text-gray-700 mt-4 text-sm">{chapter.description}</p>
        </div>

        {/* Active Lesson Toggle */}
        {activeLesson && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={toggleLessonVisibility}
              className="text-xl font-semibold text-gray-800 w-full text-left flex justify-between items-center focus:outline-none"
            >
              <span>
                Current Lesson: <br /> {activeLesson.title}
              </span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${isLessonVisible ? "transform rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isLessonVisible && (
              <div className="text-gray-600 mt-3 text-sm">
                <div dangerouslySetInnerHTML={{ __html: activeLesson.description }} />
              </div>
            )}
          </div>
        )}
      </div>
    </TabsContent>
  );
};

export default DescriptionTablist;
