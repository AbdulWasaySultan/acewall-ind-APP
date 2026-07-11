import { useContext, useEffect, useState, useMemo } from "react";
import { GlobalContext } from "@/Context/GlobalProvider";
import { StudentCard } from "@/CustomComponent/teacher/StudentCard";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Link, useParams, useLocation } from "react-router-dom";

const CourseStudents = () => {
  const { courseId } = useParams(); // courseId from URL
  const location = useLocation();
  const stateCourseTitle = location.state?.courseTitle || "";

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [courseTitle, setCourseTitle] = useState(stateCourseTitle);
  const [searchText, setSearchText] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("All");

  const { user } = useContext(GlobalContext);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 50, courseId }; // fetch enough students for dropdown
      const res = await axiosInstance.get("/course/getallCoursesforTeacher", { params });

      const studentsData = res.data.students || [];
      setStudents(studentsData);
      setTotalPages(res.data.totalPages || 1);

      // Dynamically set course title if not passed via state
      if (!courseTitle && studentsData.length > 0) {
        const course = studentsData[0].courses?.find((c) => c._id === courseId);
        if (course) setCourseTitle(course.courseTitle);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchStudents();
  }, [courseId]);

  // Filter students based on search text and dropdown
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchText.toLowerCase());
      const matchesDropdown =
        selectedStudent === "All" || student._id === selectedStudent;
      return matchesSearch && matchesDropdown;
    });
  }, [students, searchText, selectedStudent]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{courseTitle || "Course"} Students</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search students..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/2"
        />

        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/2"
        >
          <option value="All">All Students</option>
          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.firstName} {student.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Student cards */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading students...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <p className="text-center text-gray-500">No students match your filters.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStudents.map((student) => (
              <Link
                key={student._id}
                to={`/teacher/studentProfile/${student._id}`}
                state={{ student }}
              >
                <StudentCard student={student} />
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {filteredStudents.length > 0 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-3 py-1">{`Page ${page} of ${totalPages}`}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseStudents;
