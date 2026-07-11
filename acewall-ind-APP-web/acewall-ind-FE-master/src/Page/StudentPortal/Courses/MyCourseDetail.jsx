"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  ChevronRight,
  PlayCircle,
  ArrowLeft,
  Loader,
} from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import DescriptionTablist from "@/CustomComponent/Student/Course/DescriptionTablist";
import FileTablist from "@/CustomComponent/Student/Course/FileTablist";
import AssessmentTablist from "@/CustomComponent/Student/Course/AssessmentTablist";
import PagesTablist from "@/CustomComponent/Student/Course/PagesTablist";
import DiscussionTablist from "./DiscussionTablist";
import BackButton from "@/CustomComponent/BackButton";

export default function ChapterDetail() {
  const [isLessonVisible, setIsLessonVisible] = useState(false);
  const { chapterId } = useParams();
  const [courseTitle, setCourseTitle] = useState("");
  const [expandedSections, setExpandedSections] = useState({});
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chapter, setChapter] = useState(null);
  const [error, setError] = useState(null);

  // Toggle lesson content visibility
  const toggleLessonVisibility = () => setIsLessonVisible((prev) => !prev);

  // Fetch chapter data
  useEffect(() => {
    const getCourseDetails = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/enrollment/getChapter/v2/${chapterId}`,
        );
        setChapter(res.data.chapterDetails);
        console.log(res.data.chapterDetails, "chapterDetails");
      } catch (err) {
        console.error(err);
        setError(err.response.data.message || "Failed to load chapter details");
      } finally {
        setLoading(false);
      }
    };
    getCourseDetails();
  }, [chapterId]);

  function getYouTubeVideoId(url) {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  const toggleSection = (title) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleLessonKeyDown = (e, lesson) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveLesson(lesson);
    }
  };

  if (loading) {
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        role="status"
        aria-live="polite"
      >
        <Loader className="animate-spin" />
        <span className="sr-only">Loading chapter content...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!chapter) {
    return <div className="p-6 text-center">Chapter not found.</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Left side - Video and Tabs */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="p-5 border-b bg-white shadow-sm flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {courseTitle}
            </h1>
            <p className="text-sm text-gray-500">Chapter: {chapter.title}</p>
          </div>
        </div>

        {/* Active Lesson Video */}
        {activeLesson && (
          <section className="mb-8">
            <h3 className="text-lg font-semibold p-4">
              Lesson: {activeLesson.title}
            </h3>

            {activeLesson?.youtubeLinks ? (
              <div className="mt-6 flex justify-center">
                <div className="w-full max-w-screen-md rounded-lg overflow-hidden shadow-md">
                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(activeLesson.youtubeLinks)}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`Lesson Video: ${activeLesson.title}`}
                    ></iframe>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="mt-6 p-6 bg-gray-100 text-center text-sm text-gray-500 rounded-md"
                role="status"
              >
                No YouTube link available
              </div>
            )}
          </section>
        )}

        {/* Tabs */}
        <Tabs defaultValue="description" className="w-full p-5">
          <TabsList className="flex flex-wrap justify-center gap-4 w-full sm:gap-10 bg-white p-1 shadow-inner">
            {[
              "description",
              "files",
              "assessments",
              "discussions",
              "pages",
            ].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="px-3 py-2 text-base font-medium capitalize transition-all duration-300 text-gray-700 hover:text-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
                  data-[state=active]:bg-gray-100 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          <DescriptionTablist
            chapter={chapter}
            activeLesson={activeLesson}
            isLessonVisible={isLessonVisible}
            toggleLessonVisibility={toggleLessonVisibility}
          />
          <FileTablist activeLesson={activeLesson} chapter={chapter} />
          <AssessmentTablist
            chapter={chapter}
            lessonAssessments={activeLesson?.lessonAssessments}
          />
          <DiscussionTablist chapter={chapter} lesson={activeLesson} />
          <PagesTablist chapter={chapter} lesson={activeLesson} />
        </Tabs>
      </main>

      {/* Right side - Chapter Contents */}
      <aside className="w-full lg:w-80 border-l bg-gray-50 overflow-auto max-h-screen">
        <div className="p-4 border-b bg-white">
          <h2 className="text-sm font-semibold text-gray-700">
            Chapter Content
          </h2>
        </div>

        <div className="max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="border-b">
            <button
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-green-500"
              onClick={() => toggleSection(chapter.title)}
              aria-expanded={expandedSections[chapter.title] || true}
            >
              <div className="flex items-center gap-2">
                {expandedSections[chapter.title] ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-sm font-medium text-gray-800">
                  {chapter.title}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {chapter.lessons.length} lessons
              </span>
            </button>

            {(expandedSections[chapter.title] || true) && (
              <ul className="pl-6 pr-4 pb-2 space-y-1">
                {chapter.lessons.map((lesson) => {
                  const isActive = activeLesson?._id === lesson._id;
                  console.log(lesson, "lesson in map");
                  return (
                    <li key={lesson._id}>
                      <button
                        onClick={() => setActiveLesson(lesson)}
                        onKeyDown={(e) => handleLessonKeyDown(e, lesson)}
                        className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-sm transition
                        ${isActive ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-100 text-gray-700"}
                        focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        aria-current={isActive ? "true" : "false"}
                        tabIndex={0}
                      >
                        <PlayCircle
                          className={`h-4 w-4 ${isActive ? "text-blue-500" : "text-gray-400"}`}
                        />
                        <span>{lesson.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
