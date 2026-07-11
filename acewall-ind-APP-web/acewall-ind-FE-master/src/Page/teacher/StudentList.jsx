import React, { useState, useEffect } from "react";
import { Users, Mail, Calendar, UserCircle, AlertCircle, Loader } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useNavigate, useParams } from "react-router-dom";
const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [totalStudents, setTotalStudents] = useState(0);
  const { courseId } = useParams();
  const navigate = useNavigate();

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);

    await axiosInstance
      .get(`conversation/getStudentsByOfTeacher/${courseId}`)
      .then((res) => {
        setStudents(res.data.students || []);
        setTotalStudents(res.data.totalStudents || 0);
        setCourseTitle(res.data.courseTitle || "");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        console.error("Error fetching students:", err);
      });
  };

  useEffect(() => {
    if (courseId) {
      fetchStudents();
    }
  }, [courseId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  const handleConversation = async (student) => {
    try {
      await axiosInstance
        .post("conversation/create", {
          memberId: student._id,
        })
        .then((res) => {
          console.log(res, "conversation");
          navigate(`/teacher/messages/${res.data.conversation._id}`);
        });
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader className="animate-spin text-blue-700"></Loader>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border border-red-200 p-5 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Error Loading Students
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={fetchStudents}
                  className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            {courseTitle}
          </h1>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-1.5" />
            <span>
              {totalStudents} {totalStudents === 1 ? "Student" : "Students"}{" "}
              Enrolled
            </span>
          </div>
        </div>

        {/* Students List */}
        {students.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-700 mb-1">
              No students yet
            </h3>
            <p className="text-sm text-gray-500">
              Students will appear here once they enroll.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student) => (
              <div
                key={student._id}
                onClick={() => handleConversation(student)}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  {/* Left: Avatar + Info */}
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {student.profileImg?.url ? (
                        <img
                          src={student.profileImg.url}
                          alt={`${student.firstName} ${student.lastName}`}
                          className="h-14 w-14 rounded-full object-cover ring-2 ring-green-100"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center ${
                          student.profileImg?.url ? "hidden" : "flex"
                        }`}
                      >
                        <span className="text-white font-semibold text-lg">
                          {getInitials(student.firstName, student.lastName)}
                        </span>
                      </div>
                    </div>

                    {/* Student Info */}
                    <div>
                      <h3 className="text-base font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Mail className="h-3.5 w-3.5 mr-1.5" />
                        <span>{student.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Enrollment Date */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      <span>{formatDate(student.enrolledAt)}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Enrolled</div>
                  </div>
                </div>

                {/* Progress Bar (if available) */}
                {student.progress !== undefined && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                      <span>Progress</span>
                      <span className="font-medium">{student.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsList;
