import { TabsContent } from "@/components/ui/tabs";
import { DiscussionCard } from "@/CustomComponent/Card";
import { axiosInstance } from "@/lib/AxiosInstance";
import React, { useEffect, useState } from "react";

const DiscussionTablist = ({ chapter, lesson }) => {
  const [chapterDiscussion, setChapterDiscussion] = useState([]);
  const [lessonDiscussion, setLessonDiscussion] = useState([]);

  // Fetch chapter discussions
  const getDiscussionForChapter = async () => {
    try {
      const response = await axiosInstance.get(`/discussion/chapter/${chapter._id}`);
      setChapterDiscussion(response.data.discussions);
    } catch (error) {
      console.error("Error fetching chapter discussions:", error);
    }
  };

  // Fetch lesson discussions
  const getDiscussionForLesson = async () => {
    if (!lesson) return;
    try {
      const res = await axiosInstance.get(`/discussion/lesson/${lesson._id}`);
      setLessonDiscussion(res.data.discussion);
    } catch (error) {
      console.error("Error fetching lesson discussions:", error);
    }
  };

  useEffect(() => {
    getDiscussionForChapter();
    getDiscussionForLesson();
  }, [lesson]);

  // Keyboard activation for discussion cards
  const handleCardKeyDown = (e, link) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      window.location.href = link;
    }
  };

  return (
    <section aria-labelledby="discussion-tablist">
      <TabsContent
        value="discussions"
        className="p-6 bg-white rounded-lg shadow-md"
      >
        {/* Chapter Discussion */}
        <section aria-label="Chapter Discussion">
          <h2 id="discussion-tablist" className="text-lg font-semibold text-gray-700 mb-4">
            Chapter Discussion
          </h2>

          {chapterDiscussion?.length === 0 ? (
            <p className="text-sm text-gray-500 mt-4" role="status">
              No discussions found for this chapter.
            </p>
          ) : (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chapterDiscussion.map((discussion) => (
                <div
                  key={discussion._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => window.location.href = `/student/discussions/${discussion._id}`}
                  onKeyDown={(e) => handleCardKeyDown(e, `/student/discussions/${discussion._id}`)}
                  className="focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label={`Discussion: ${discussion.title}`}
                >
                  <DiscussionCard
                    discussion={discussion}
                    link={`/student/discussions/${discussion._id}`}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Lesson Discussion */}
        <section aria-label="Lesson Discussion" className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Lesson Discussion</h2>

          {lessonDiscussion?.length === 0 || !lesson ? (
            <p className="text-sm text-gray-500 mt-4" role="status">
              No discussions found for this lesson.
            </p>
          ) : (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessonDiscussion.map((discussion) => (
                <div
                  key={discussion._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => window.location.href = `/student/discussions/${discussion._id}`}
                  onKeyDown={(e) => handleCardKeyDown(e, `/student/discussions/${discussion._id}`)}
                  className="focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label={`Discussion: ${discussion.title}`}
                >
                  <DiscussionCard
                    discussion={discussion}
                    link={`/student/discussions/${discussion._id}`}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </TabsContent>
    </section>
  );
};

export default DiscussionTablist;
