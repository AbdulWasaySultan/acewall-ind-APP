"use client";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  ChevronRight,
  PlayCircle,
  Star,
  FileText,
  ArrowLeft,
  Loader,
} from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import LoadingLoader from "@/CustomComponent/LoadingLoader";
import DescriptionTablist from "@/CustomComponent/Student/Course/DescriptionTablist";
import FileTablist from "@/CustomComponent/Student/Course/FileTablist";
import PagesTablist from "@/CustomComponent/Student/Course/PagesTablist";
import AssessmentTablistStdPre from "@/CustomComponent/teacher/AssessmentTablistStdPre";
import DiscussionTablist from "@/Page/StudentPortal/Courses/DiscussionTablist";

export default function ChapterDetailStdPre() {
  const [isLessonVisible, setIsLessonVisible] = useState(false);
  const { chapterId } = useParams();
  const [courseTitle, setCourseTitle] = useState("");
  const [instructor, setInstructor] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chapter, setChapter] = useState(null);

  // Toggle the visibility of the lesson content
  const toggleLessonVisibility = () => {
    setIsLessonVisible((prevState) => !prevState);
  };
  useEffect(() => {
    const getCourseDetails = async () => {
      setLoading(true);
      await axiosInstance
        .get(`/enrollment/getChapterstdpre/${chapterId}`)
        .then((res) => {
          setChapter(res.data.chapterDetails);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setError(err.response.data.message || "Something went wrong");
        });
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if(error){
    return <div className="p-6 text-center">{error}</div>;
  }

  if (!chapter) {
    return <div className="p-6 text-center">Chapter not found.</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Left side - Video and Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-5 border-b bg-white shadow-sm flex items-center gap-3 ">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:text-black"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {courseTitle}
            </h1>
            <p className="text-sm text-gray-500">Chapter: {chapter.title}</p>
          </div>
        </div>

        {activeLesson && (
          <div className="mb-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold p-4">
                Lesson: {activeLesson.title}
              </h3>

              {/* Video Player */}
              {activeLesson?.youtubeLinks ? (
                <div className="mt-6 flex  justify-center">
                  <div className="w-full max-w-screen-md rounded-lg overflow-hidden shadow-md">
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                          activeLesson.youtubeLinks,
                        )}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Lesson Video"
                      ></iframe>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 p-6 bg-gray-100 text-center text-sm text-gray-500 rounded-md">
                  No YouTube link available
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="description" className="w-full p-5">
          <TabsList className="flex flex-wrap justify-center gap-4 w-full  sm:gap-10  bg-white p-1 shadow-inner">
            {[
              "description",
              "files",
              "Assessments",
              "Pages",
              "Discussions",
            ].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="px-3 py-2 text-base font-medium  capitalize transition-all duration-300 
              text-gray-700 hover:text-green-600 hover:bg-gray-50 
              data-[state=active]:bg-gray-100 data-[state=active]:text-green-600 data-[state=active]:shadow-sm"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Description */}
          <DescriptionTablist
            chapter={chapter}
            activeLesson={activeLesson}
            isLessonVisible={isLessonVisible}
            toggleLessonVisibility={toggleLessonVisibility}
          />

          {/* Files */}
          <FileTablist activeLesson={activeLesson} chapter={chapter} />

          {/* Assessment */}
          <AssessmentTablistStdPre
            chapter={chapter}
            lessonAssessments={activeLesson?.lessonAssessments}
          />

          <PagesTablist chapter={chapter} lesson={activeLesson} />

          <DiscussionTablist chapter={chapter} lesson={activeLesson} />
        </Tabs>
      </div>

      {/* Right side - Course Contents */}
      <div className="w-full lg:w-80 border-l bg-gray-50 overflow-auto max-h-screen">
        {/* Header */}
        <div className="p-4 border-b bg-white ">
          <h2 className="text-sm font-semibold text-gray-700">
            Chapter Content
          </h2>
        </div>

        {/* Chapter Toggle Section */}
        <div className="max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="border-b">
            <button
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-100 transition"
              onClick={() => toggleSection(chapter.title)}
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
              <div className="pl-6 pr-4 pb-2">
                {chapter.lessons.map((lesson, lessonIndex) => {
                  const isActive =
                    activeLesson && activeLesson._id === lesson._id;
                  return (
                    <button
                      key={lessonIndex}
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-sm transition 
                  ${
                    isActive
                      ? "bg-green-100 text-green-700 font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                    >
                      <PlayCircle
                        className={`h-4 w-4 ${
                          isActive ? "text-green-500" : "text-gray-400"
                        }`}
                      />
                      <span>
                        Lesson {lessonIndex + 1}: {lesson.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
