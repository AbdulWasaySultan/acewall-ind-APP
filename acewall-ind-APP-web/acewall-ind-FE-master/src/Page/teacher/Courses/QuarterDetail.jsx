"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BookOpen, GraduationCap, Eye, Loader } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ChapterCreationModal from "@/CustomComponent/CreateCourse/CreatChapterModal";
import EditChapterDialog from "@/CustomComponent/CreateCourse/EditChapter";
import { DeleteModal } from "../../../CustomComponent/CreateCourse/DeleteModal";
import BackButton from "@/CustomComponent/BackButton";

const QuarterDetail = () => {
  const { courseId } = useParams();
  const [firstLoading, setFirstLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [quarterStartDate, setQuarterStartDate] = useState("");
  const [quarterEndDate, setQuarterEndDate] = useState("");
  const [searchParams] = useSearchParams();

  const semesterbased = searchParams.get("semesterbased");
  const quarterId = searchParams.get("quarterID");

  const fetchQuarterDetail = async () => {
    try {
      const response = await axiosInstance.get(
        `chapter/${courseId}/${quarterId}`
      );

      // Validate the structure of response
      if (response?.data?.chapters) {
        setChapters(response.data.chapters);
        setQuarterStartDate(response.data.quarterStartDate);
        setQuarterEndDate(response.data.quarterEndDate);
        setFirstLoading(false);
      } else {
        setChapters([]);
        toast.error("Invalid response format from server.");
        setFirstLoading(false);
      }
    } catch (err) {
      console.error("fetchQuarterDetail API Error:", err);
      setChapters([]);
      setFirstLoading(false);
    }
  };

  const fetchChapterOfCourse = async () => {
    try {
      const response = await axiosInstance.get(
        `chapter/chapterofCourse/v2/${courseId}`
      );

      console.log(response, "response");
      setChapters(response.data.chapters);
      setFirstLoading(false);
    } catch (error) {
      console.error("fetchChapterOfCourse API Error:", error);
      setChapters([]);
      setFirstLoading(false);
    }
  };

  useEffect(() => {
    if (semesterbased === "true") {
      fetchQuarterDetail();
    } else if (semesterbased === "false") {
      fetchChapterOfCourse();
    }
  }, [semesterbased, quarterId, courseId]);

  const refreshChapters = () => {
    if (semesterbased === "true") {
      fetchQuarterDetail();
    } else {
      fetchChapterOfCourse();
    }
  };

  const handleDeleteChapter = async (chapterID) => {
    setLoading(true);
    try {
      const response = await axiosInstance.delete(`chapter/${chapterID}`);
      toast.success(response.data.message);
      refreshChapters();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting chapter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <BackButton className="mb-10" />
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chapters</h1>
                <p className="text-gray-600">
                  Manage your chapters and course content
                </p>
              </div>
            </div>
            <ChapterCreationModal
              courseId={courseId}
              quarterId={semesterbased ? quarterId : null}
              fetchQuarterDetail={fetchQuarterDetail}
              refreshChapters={refreshChapters}
            />
          </div>
        </div>

        {/* Chapters Grid */}
        {firstLoading ? (
          <Loader className="animate-spin mx-auto mt-10"/>
        ) : chapters.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No chapters yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first chapter to get started with organizing your
              course content.
            </p>
            <ChapterCreationModal
              courseId={courseId}
              quarterId={semesterbased ? quarterId : null}
              fetchQuarterDetail={fetchQuarterDetail}
              refreshChapters={refreshChapters}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chapters.map((chapter, index) => (
              <Card
                key={chapter._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        Chapter {index + 1}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <DeleteModal
                        what="chapter"
                        deleteFunc={() => handleDeleteChapter(chapter._id)}
                      />
                    </div>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {chapter.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {chapter.description}
                  </p>

                  {/* Stats */}
                  {/* <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex flex-wrap items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <p>{chapter?.lessons?.length || 0} Lessons</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      <p className="">
                        {chapter.chapter_assessments?.length || 0} Assessments
                      </p>
                    </div>
                  </div> */}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Link
                      to={`/teacher/courses/chapter/${chapter._id}?courseId=${courseId}&quarterId=${quarterId}&semesterbased=${semesterbased}`}
                      className="flex-1"
                    >
                      <Button
                        className="w-full bg-green-500 bg-green-600"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuarterDetail;
