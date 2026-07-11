import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  FileText,
  Youtube,
  Link2,
  GraduationCap,
  Loader,
} from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Link, useParams, useSearchParams } from "react-router-dom";
import EditLessonModal from "@/CustomComponent/CreateCourse/EditLesson";
import { DeleteModal } from "@/CustomComponent/CreateCourse/DeleteModal";
import EditChapterDialog from "@/CustomComponent/CreateCourse/EditChapter";
import AddMoreFile from "@/CustomComponent/CreateCourse/addMoreFile";
import BackButton from "@/CustomComponent/BackButton";
import ChapterOptionDropdown from "@/CustomComponent/CreateCourse/ChapterOptionDropdown";

const TeacherChapterDetail = () => {
  const { chapterId } = useParams();
  const [searchParams] = useSearchParams();

  const courseId = searchParams.get("courseId");
  const quarterStart = searchParams.get("quarterStart");
  const quarterEnd = searchParams.get("quarterEnd");
  const semesterbased = searchParams.get("semesterbased");

  const [loading, setLoading] = useState(false);
  const [chapter, setChapter] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [expandedDescIds, setExpandedDescIds] = useState([]);

  const toggleDescription = (id) => {
    setExpandedDescIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const truncateText = (text, limit = 150) => {
    if (!text || text.length <= limit) return text;
    return text.slice(0, limit) + "...";
  };

  const fetchChapterDetail = async () => {
    try {
      const response = await axiosInstance.get(
        `chapter/chapter/chapter&lessons/${chapterId}`,
      );
      setChapter(response.data.chapter);
      setLessons(response.data.chapter.lessons || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (chapterId) {
      fetchChapterDetail();
    }
  }, [chapterId]);

  const handleDeleteLesson = async (lessonID) => {
    setLoading(true);
    try {
      const response = await axiosInstance.delete(`lesson/${lessonID}`);
      toast.success(response.data.message);
      fetchChapterDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting lesson");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssessment = async (assessmentID) => {
    setLoading(true);
    try {
      const response = await axiosInstance.delete(
        `/assessment/delete/${assessmentID}`,
      );
      toast.success(response.data.message);
      fetchChapterDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId, lessonId) => {
    await axiosInstance
      .delete(`lesson/delete/${lessonId}/${fileId}`)
      .then((res) => {
        toast.success(res.data.message);
        fetchChapterDetail();
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response?.data?.message || "Error deleting file");
      });
  };

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto text-center py-20">
          <Loader className="animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading chapter details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <BackButton />

        {/* Chapter Info Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <section className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {chapter.title}
                </h1>
                <div className="text-gray-600 mt-1">
                  <p
                    className={
                      expandedDescIds.includes(chapter._id)
                        ? ""
                        : "line-clamp-2"
                    }
                  >
                    {chapter.description}
                  </p>
                  {chapter.description?.length > 150 && (
                    <button
                      onClick={() => toggleDescription(chapter._id)}
                      className="text-blue-600 font-medium text-sm hover:underline mt-1"
                    >
                      {expandedDescIds.includes(chapter._id)
                        ? "Read Less"
                        : "Read More"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 h-fit">
              <EditChapterDialog
                chapterId={chapter._id}
                title={chapter.title}
                description={chapter.description}
                fetchChapterDetail={fetchChapterDetail}
              />
              <ChapterOptionDropdown
                type="chapter"
                typeId={chapterId}
                semesterbased={semesterbased}
                fetchChapterDetail={fetchChapterDetail}
                quarterId={chapter.quarter?._id}
                semesterId={chapter.semester?._id}
                quarterStart={quarterStart}
                quarterEnd={quarterEnd}
                courseId={courseId}
                chapterId={chapter._id}
              />
            </div>
          </section>
        </div>

        {/* Chapter Assessments */}
        {chapter.chapter_assessments?.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5 text-orange-600" />
                Chapter Assessments
                <Badge variant="secondary">
                  {chapter.chapter_assessments.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chapter.chapter_assessments.map((assessment) => (
                  <div
                    key={assessment._id}
                    className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="outline">
                        {assessment.category?.name}
                      </Badge>
                      <DeleteModal
                        deleteFunc={() =>
                          handleDeleteAssessment(assessment._id)
                        }
                      />
                    </div>
                    <Link
                      to={`/teacher/courses/assessment/${assessment._id}`}
                      className="block group"
                    >
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {assessment.title}
                      </h4>
                    </Link>
                    <div className="text-sm text-gray-600 mt-2">
                      <p
                        className={
                          expandedDescIds.includes(assessment._id)
                            ? ""
                            : "line-clamp-2"
                        }
                      >
                        {assessment.description}
                      </p>
                      {assessment.description?.length > 100 && (
                        <button
                          onClick={() => toggleDescription(assessment._id)}
                          className="text-blue-600 font-medium text-xs hover:underline mt-1"
                        >
                          {expandedDescIds.includes(assessment._id)
                            ? "Read Less"
                            : "Read More"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lessons List */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Lessons
              <Badge variant="secondary">{lessons.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lessons.length === 0 ? (
              <div className="text-center py-10">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">
                  No lessons yet
                </h3>
                <p className="text-gray-500">
                  Create a lesson to start building your chapter.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {lessons.map((lesson, index) => (
                  <Card
                    key={lesson._id}
                    className="border-l-4 border-l-blue-500 bg-white"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-100 text-blue-800 border-none">
                            Lesson {index + 1}
                          </Badge>
                          <h4 className="font-bold text-gray-900">
                            {lesson.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <EditLessonModal
                            lesson={lesson}
                            fetchChapterDetail={fetchChapterDetail}
                          />
                          <ChapterOptionDropdown
                            type="lesson"
                            typeId={lesson._id}
                            fetchChapterDetail={fetchChapterDetail}
                            courseId={courseId}
                            semesterbased={semesterbased}
                            quarterId={chapter.quarter?._id}
                            semesterId={chapter.semester?._id}
                          />
                          <DeleteModal
                            deleteFunc={() => handleDeleteLesson(lesson._id)}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {/* Lesson Description with Read More */}
                      {lesson.description && (
                        <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                          <div
                            className={`overflow-hidden transition-all duration-300 ${expandedDescIds.includes(lesson._id) ? "" : "max-h-20"}`}
                            dangerouslySetInnerHTML={{
                              __html: lesson.description,
                            }}
                          />
                          {lesson.description.length > 200 && (
                            <button
                              onClick={() => toggleDescription(lesson._id)}
                              className="text-blue-600 font-medium text-xs hover:underline mt-2 block"
                            >
                              {expandedDescIds.includes(lesson._id)
                                ? "Show Less ↑"
                                : "Read Full Description ↓"}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Files Section */}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="text-sm font-bold text-gray-800">
                            Files
                          </h5>
                          <AddMoreFile
                            lessonId={lesson._id}
                            fetchChapterDetail={fetchChapterDetail}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {lesson.pdfFiles.length === 0 ? (
                            <p className="text-xs text-gray-500 italic">
                              No files attached
                            </p>
                          ) : (
                            lesson.pdfFiles.map((pdf, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-2 rounded-md border bg-gray-50 group"
                              >
                                <a
                                  href={pdf.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-blue-700 hover:underline truncate mr-2"
                                >
                                  <FileText className="h-4 w-4 shrink-0" />
                                  <span className="truncate">
                                    {pdf.filename}
                                  </span>
                                </a>
                                <DeleteModal
                                  what="File"
                                  deleteFunc={() =>
                                    handleDeleteFile(pdf._id, lesson._id)
                                  }
                                />
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Resources Section */}
                      <div className="border-t pt-4">
                        <h5 className="text-sm font-bold text-gray-800 mb-3">
                          Resources
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {lesson.youtubeLinks && (
                            <a
                              href={lesson.youtubeLinks}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-md text-xs font-medium hover:bg-red-100 transition-colors border border-red-100"
                            >
                              <Youtube className="h-4 w-4" /> YouTube Video
                            </a>
                          )}
                          {lesson.otherLink && (
                            <a
                              href={lesson.otherLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-md text-xs font-medium hover:bg-purple-100 transition-colors border border-purple-100"
                            >
                              <Link2 className="h-4 w-4" /> External Link
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Lesson Assessments */}
                      {lesson.lesson_assessments?.length > 0 && (
                        <div className="border-t pt-4">
                          <h5 className="text-sm font-bold text-gray-800 mb-3">
                            Lesson Assessments (
                            {lesson.lesson_assessments.length})
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {lesson.lesson_assessments.map((assessment) => (
                              <div
                                key={assessment._id}
                                className="p-3 border rounded-md bg-white hover:border-blue-300 transition-colors"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    {assessment.category?.name}
                                  </Badge>
                                  <DeleteModal
                                    what="Assessment"
                                    deleteFunc={() =>
                                      handleDeleteAssessment(assessment._id)
                                    }
                                  />
                                </div>
                                <Link
                                  to={`/teacher/courses/assessment/${assessment._id}`}
                                  className="font-semibold text-sm hover:text-blue-600 block mb-1"
                                >
                                  {assessment.title}
                                </Link>
                                <div className="text-xs text-gray-500">
                                  <p
                                    className={
                                      expandedDescIds.includes(assessment._id)
                                        ? ""
                                        : "line-clamp-2"
                                    }
                                  >
                                    {assessment.description}
                                  </p>
                                  {assessment.description?.length > 80 && (
                                    <button
                                      onClick={() =>
                                        toggleDescription(assessment._id)
                                      }
                                      className="text-blue-600 font-medium hover:underline mt-1"
                                    >
                                      {expandedDescIds.includes(assessment._id)
                                        ? "Less"
                                        : "More"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherChapterDetail;
