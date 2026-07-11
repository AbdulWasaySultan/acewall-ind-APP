import { axiosInstance } from "@/lib/AxiosInstance";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Loader } from "lucide-react";
import BackButton from "@/CustomComponent/BackButton";

const AllChapter = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [quarterStartDate, setQuarterStartDate] = useState("");
  const [quarterEndDate, setQuarterEndDate] = useState("");
  const [searchParams] = useSearchParams();
  const [error, setErrors] = useState();
  const [loading, setLoading] = useState(true);

  const semesterbased = searchParams.get("semesterbased");
  const quarterId = searchParams.get("quarterID");
  const actualcourseID = searchParams.get("courseId");

  // Fetch chapters for a specific quarter
  const fetchQuarterDetail = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`chapter/${courseId}/${quarterId}`);
      const data = res.data;

      if (Array.isArray(data.chapters)) {
        setChapters(data.chapters);
        setQuarterStartDate(data.quarterStartDate);
        setQuarterEndDate(data.quarterEndDate);
      } else {
        setChapters([]);
      }
    } catch (err) {
      console.error("Error fetching chapters:", err);
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch chapters for the entire course
  const fetchChapterOfCourse = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `chapter/chapterofCourse/v2/${actualcourseID}`,
      );
      setChapters(response.data.chapters);
    } catch (error) {
      console.error("fetchChapterOfCourse API Error:", error);
      setErrors(error?.response?.data?.message || "Failed to fetch chapters");
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (semesterbased === "true") {
      fetchQuarterDetail();
    } else if (semesterbased === "false") {
      fetchChapterOfCourse();
    }
  }, [semesterbased, quarterId, courseId]);

  if (loading) {
    return (
      <main className="flex justify-center items-center h-64" aria-labelledby="loading-title">
        <Loader size={32} className="animate-spin text-blue-500" />
      </main>
    );
  }

  // Handle keyboard activation (Enter key) for accessibility
  const handleKeyDown = (e, chapterId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(
        `/student/mycourses/${courseId}/chapters/chapter/${chapterId}?quarterID=${quarterId}`,
      );
    }
  };

  if (error) {
    return (
      <main aria-labelledby="chapters-title" className="space-y-4">
        <div className="mb-4">
          <BackButton />
        </div>
        <h2 id="chapters-title" className="text-lg font-semibold mb-4">
          Chapters
        </h2>
        <div className="text-red-500">Error: {error}</div>
      </main>
    );
  }

  return (
    <main aria-labelledby="chapters-title" className="space-y-4">
      <div className="mb-4">
        <BackButton />
      </div>
      <h2 id="chapters-title" className="text-lg font-semibold mb-4">
        Chapters
      </h2>

      {chapters.length > 0 ? (
        chapters.map((chapter, index) => (
          <div
            key={chapter._id}
            role="button"
            tabIndex={0}
            onClick={() =>
              navigate(
                `/student/mycourses/${courseId}/chapters/chapter/${chapter._id}?quarterID=${quarterId}`,
              )
            }
            onKeyDown={(e) => handleKeyDown(e, chapter._id)}
            className="mb-4 border border-gray-200 p-5 rounded-lg bg-blue-50 hover:bg-blue-100 cursor-pointer transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label={`Chapter ${index + 1}: ${chapter.title}. Press Enter to view chapter.`}
          >
            <span className="text-sm font-semibold text-gray-700">
              Chapter: {index + 1}
            </span>
            <h3 className="font-semibold text-md text-blue-800">
              {chapter.title}
            </h3>
            <p className="font-light text-sm text-muted-foreground">
              {chapter.description}
            </p>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground" role="status">
          No chapters available.
        </p>
      )}
    </main>
  );
};

export default AllChapter;
