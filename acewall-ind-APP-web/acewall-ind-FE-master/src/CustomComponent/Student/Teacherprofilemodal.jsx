import { axiosInstance } from "@/lib/AxiosInstance";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const TeacherProfileModal = ({ isOpen, onClose, instructor, avatar }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!instructor?._id || !isOpen) return;

    const fetchTeacherCourses = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/course/getTeacherCoursesForDesboard", {
          params: { teacherId: instructor._id },
        });
        setCourses(res.data.courses || []);
        console.log("res", res);
      } catch (error) {
        console.error("Error fetching teacher's courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherCourses();
  }, [instructor?._id, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="flex items-center gap-4">
          <img
            src={instructor?.profileImg?.url || avatar}
            alt="Instructor"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-2xl font-semibold">
              {instructor.firstName} {instructor.middleName} {instructor.lastName}
            </h2>
            <p className="text-sm text-gray-500">Instructor</p>
          </div>
        </div>

        {/* <div className="mt-4 text-gray-700 whitespace-pre-wrap text-sm">
          {instructor.Bio || "No bio provided."}
        </div> */}

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Courses by this Instructor</h3>
          {loading ? (
            <p className="text-sm text-gray-500">Loading courses...</p>
          ) : courses.length > 0 ? (
            <ul className="space-y-3">
              {courses.map((course) => (
                <li key={course.courseId}>
                  <Link
                    to={`/student/course/detail/${course.courseId}`}
                    className="border p-3 rounded-md flex items-start gap-3 hover:bg-gray-100 transition cursor-pointer"
                    aria-label={`Go to course: ${course.courseTitle}`}
                  >
                    <img
                      src={course.courseImageUrl || "/placeholder.svg"}
                      alt={course.courseTitle}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{course.courseTitle}</p>
                      <p className="text-xs text-gray-500">
                        Category: {course?.category || "N/A"}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No courses found for this instructor.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherProfileModal;
