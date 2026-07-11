import { GlobalContext } from "@/Context/GlobalProvider";
import { StudentCard } from "@/CustomComponent/teacher/StudentCard";

import { axiosInstance } from "@/lib/AxiosInstance";
import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

// CourseCard component
const CourseCard = ({ course, selected, onClick }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer border rounded-xl shadow-sm p-4 flex flex-col items-center hover:shadow-lg transition-all
      ${selected ? "border-green-600 shadow-md" : "border-gray-200"}`}
  >
    {course.thumbnail && (
      <img
        src={course.thumbnail}
        alt={course.courseTitle}
        className="w-24 h-24 object-cover rounded-md mb-3"
      />
    )}
    <h3 className="font-semibold text-gray-800 text-center">{course.courseTitle}</h3>
  </div>
);

const AllStudent = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { user } = useContext(GlobalContext);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 8 };
      if (selectedCourse && selectedCourse !== "All") {
        params.courseTitle = selectedCourse;
      }

      const res = await axiosInstance.get("/course/getallCoursesforTeacher", { params });
      setStudents(res.data.students || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      alert("Failed to load students. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, selectedCourse]);

  // Extract unique courses from students
  const courses = useMemo(() => {
    const allCourses = students.flatMap((s) => s.courses || []);
    const unique = [];

    allCourses.forEach((course) => {
      if (!unique.some((c) => c.courseTitle === course.courseTitle)) {
        unique.push({
          courseTitle: course.courseTitle,
          thumbnail: course.thumbnail?.url,
        });
      }
    });

    return [{ courseTitle: "All", thumbnail: null }, ...unique];
  }, [students]);

  return (
    <div className="container mx-auto px-4 py-8" role="main" aria-label="All students list page">
      <h1 className="text-2xl font-bold mb-6" tabIndex={0}>
        Students <span className="font-normal text-gray-500">({students?.length.toLocaleString()})</span>
      </h1>

      {/* Course Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {courses.map((course, idx) => (
          <CourseCard
            key={idx}
            course={course}
            selected={selectedCourse === course.courseTitle}
            onClick={() => {
              setSelectedCourse(course.courseTitle);
              setPage(1);
            }}
          />
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center space-x-2" role="status" aria-live="polite">
          <div className="spinner" aria-hidden="true"></div>
          <p>Loading students...</p>
        </div>
      ) : students.length === 0 ? (
        <p role="alert">No students found. Please try selecting a different course.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" role="list">
            {students.map((student, index) => (
              <Link
                key={index}
                to={`/teacher/studentProfile/${student._id}`}
                state={{ student }}
                role="listitem"
                aria-label={`View profile of ${student.firstName} ${student.lastName}`}
              >
                <StudentCard student={student} />
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6 space-x-2" aria-label="Pagination controls">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
              aria-disabled={page === 1}
              aria-label="Go to previous page"
            >
              Prev
            </button>

            <span className="px-3 py-1" aria-live="polite" aria-atomic="true">
              {`Page ${page} of ${totalPages}`}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
              aria-disabled={page === totalPages}
              aria-label="Go to next page"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AllStudent;
