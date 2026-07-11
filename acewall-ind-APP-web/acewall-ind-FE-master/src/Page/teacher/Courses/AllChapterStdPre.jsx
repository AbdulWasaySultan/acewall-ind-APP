import BackButton from "@/CustomComponent/BackButton";
import { axiosInstance } from "@/lib/AxiosInstance";
import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

const AllChapterStdPre = () => {
  const { courseId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [quarterStartDate, setQuarterStartDate] = useState("");
  const [quarterEndDate, setQuarterEndDate] = useState("");
  const [searchParams] = useSearchParams();

  const semesterbased = searchParams.get("semesterbased");
  const quarterId = searchParams.get("quarterId");
  const actualcourseID = searchParams.get("courseId")

  console.log(courseId, "courseIds")

  const fetchQuarterDetail = async () => {
    try {
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
    }
  };

  const fetchChapterOfCourse = async () => {
    try {
      const response = await axiosInstance.get(
        `chapter/chapterofCourse/${courseId}`
      );

      setChapters(response.data.chapters);
    } catch (error) {
      console.error("fetchChapterOfCourse API Error:", error);
      setChapters([]);
    }
  };

  useEffect(() => {
    if (semesterbased === "true") {
      fetchQuarterDetail();
    } else if (semesterbased === "false") {
      fetchChapterOfCourse();
    }
  }, [semesterbased, quarterId, courseId]);

  return (
    <div>
       <BackButton className="mb-10"/>
      <div className="text-lg font-semibold mb-4">Chapters:</div>
      {chapters.map((chapter, index) => (
        <Link
          key={chapter._id}
          to={`/teacher/courses/${courseId}/quarterStdPre/chapterStdPre/${chapter._id}`}
        >
          <span className="text-sm font-semibold text-gray-700">
            Chapter: {index + 1}
          </span>
          <div className="mb-4 border border-gray-200 p-5 rounded-lg bg-blue-50 hover:bg-blue-100 cursor-pointer transition-all duration-200 shadow-sm">
            <h3 className="font-semibold text-md text-blue-800">
              {chapter.title}
            </h3>
            <p className="font-light text-sm text-muted-foreground">
              {chapter.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default AllChapterStdPre;
