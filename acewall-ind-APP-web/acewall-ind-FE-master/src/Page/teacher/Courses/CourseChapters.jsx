import { useContext, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  File,
  Plus,
  Edit,
  Eye,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Youtube } from "lucide-react";
import ChapterCreationModal from "@/CustomComponent/CreateCourse/CreatChapterModal";
import { CourseContext } from "@/Context/CoursesProvider";
import ConfirmationModal from "@/CustomComponent/CreateCourse/ConfirmationModal";
import CourseConfirmationModal from "@/CustomComponent/CreateCourse/CourseConfirmationModal";
import LessonDialog from "../../../CustomComponent/CreateCourse/LessonModal";
import { AssessmentDialog } from "./Models/AssessmentFields";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";

export default function CoursesChapter() {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const { course, setCourse, courseLoading, setCourseLoading } =
    useContext(CourseContext);

  const handleDeleteChapter = (chapterId) => {
    console.log(chapterId, "chapterId");

    const updatedChapters = course.chapters.filter(
      (chapter) => chapter.id !== chapterId
    );
    // setChapters(updatedChapters);
    setCourse((prev) => ({ ...prev, chapters: updatedChapters }));
  };

  const handleSubmit = async () => {
    try {
      setCourseLoading(true);
      const res = await axiosInstance.post("course/create", course, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(res.data.message);
      setCourseLoading(false);
      navigate("/teacher/courses");
      setCourse({});
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "An error occurred");
      setCourseLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <section className="flex justify-between items-center border-b p-4">
        <div className="">
          <h2 className="text-2xl font-semibold flex items-center">
            <div className="w-1 h-8 bg-green-500 mr-2"></div>
            Chapters
          </h2>
        </div>
        <div>
          <ChapterCreationModal />
        </div>
      </section>
      <div className="rounded-lg ">
        {course?.chapters?.length === 0 ? (
          <p>No Chapters Available</p>
        ) : (
          course.chapters?.map((chapter, index) => (
            <div key={index} className="bg-gray-50 rounded-lg">
              <Collapsible open={chapter.isOpen}>
                <div className="flex items-center justify-between p-4">
                  <CollapsibleTrigger className="flex items-center text-left w-full justify-between">
                    <span className="font-semibold flex">
                      {chapter.isOpen ? (
                        <ChevronDown className="h-5 w-5 mr-2 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0" />
                      )}
                      Chapter : {chapter.title} ({chapter?.lessons?.length}{" "}
                      Lessons)
                    </span>
                    <div className="flex gap-2">
                      <LessonDialog id={chapter.id} />
                      {!chapter.Assessment && (
                        <AssessmentDialog id={chapter.id} />
                      )}

                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteChapter(chapter.id)}
                      >
                        <Trash className="h-4 w-4 " />
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="border rounded-lg mx-4 mb-4 bg-white">
                    {chapter?.lessons?.map((lesson, index) => (
                      <div
                        key={index}
                        className="flex flex-col border-b last:border-b-0 p-4 space-y-2"
                      >
                        {/* Lessons Header */}
                        <h2 className="text-xl font-bold text-primary mb-2">
                          Lessons {index + 1}
                        </h2>

                        {/* Title */}
                        <div>
                          <span className="font-medium text-gray-700">
                            Title:
                          </span>{" "}
                          <span className="text-gray-800">
                            {lesson.title?.trim() ? (
                              lesson.title
                            ) : (
                              <span className="italic text-gray-500">
                                Title is not available.
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Description */}
                        <div>
                          <span className="font-medium text-gray-700">
                            Description:
                          </span>{" "}
                          <span className="text-gray-800">
                            {lesson.description?.trim() ? (
                              lesson.description
                            ) : (
                              <span className="italic text-gray-500">
                                Description is not available.
                              </span>
                            )}
                          </span>
                        </div>

                        {/* PDFs */}
                        <div>
                          <span className="font-medium text-gray-700">
                            PDFs:
                          </span>
                          {lesson.pdfFiles?.length > 0 ? (
                            <ul className="list-disc list-inside text-sm text-blue-600 mt-1">
                              {lesson.pdfFiles.map((pdf, idx) => (
                                <li key={idx}>
                                  <a
                                    href={pdf.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {pdf.name || `PDF ${idx + 1}`}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="italic text-gray-500 ml-2">
                              PDFs are not available.
                            </p>
                          )}
                        </div>

                        {/* YouTube Links */}
                        <div>
                          <span className="font-medium text-gray-700">
                            YouTube Links:
                          </span>
                          {lesson.youtubeLinks.length > 0 ? (
                            <p>{lesson.youtubeLinks}</p>
                          ) : (
                            <p className="italic text-gray-500 ml-2">
                              YouTube links are not available.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    {chapter.Assessment && (
                      <div
                        key={index}
                        className="flex flex-col border-b last:border-b-0 p-4 space-y-2"
                      >
                        {/* Assessment Header */}
                        <h2 className="text-xl font-bold text-primary mb-2">
                          Assessments
                        </h2>

                        {/* Title */}
                        <div>
                          <span className="font-medium text-gray-700">
                            Title:
                          </span>{" "}
                          <span className="text-gray-800">
                            {chapter?.Assessment?.title ? (
                              chapter.Assessment.title
                            ) : (
                              <span className="italic text-gray-500">
                                Title is not available.
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Description */}
                        <div>
                          <span className="font-medium text-gray-700">
                            Description:
                          </span>{" "}
                          <span className="text-gray-800">
                            {chapter?.Assessment?.description?.trim() ? (
                              chapter.Assessment.description
                            ) : (
                              <span className="italic text-gray-500">
                                Description is not available.
                              </span>
                            )}
                          </span>
                        </div>

                        {/* PDFs */}
                        <div>
                          <span className="font-medium text-gray-700">
                            PDFs:
                          </span>
                          {chapter?.Assessment?.pdfFiles?.length > 0 ? (
                            <ul className="list-disc list-inside text-sm text-blue-600 mt-1">
                              {chapter.Assessment.pdfFiles.map((pdf, idx) => (
                                <li key={idx}>
                                  <a
                                    href={pdf.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {pdf.name || `PDF ${idx + 1}`}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="italic text-gray-500 ml-2">
                              PDFs are not available.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))
        )}
      </div>

      <div className="p-4 flex justify-between">
        <Link to="/teacher/courses/createCourses/">
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back
          </Button>
        </Link>
        <CourseConfirmationModal
          submit={() => handleSubmit()}
          chapters={course.chapters}
        />
      </div>
    </div>
  );
}
