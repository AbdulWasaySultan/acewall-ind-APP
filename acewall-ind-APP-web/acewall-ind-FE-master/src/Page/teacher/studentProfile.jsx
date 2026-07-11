import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  StudentProfileCourseCard,
  StudentProfileStatCard,
} from "@/CustomComponent/Card";
import { Mail, Calendar, School } from "lucide-react";
import avatar from "@/assets/avatar.png";
import { axiosInstance } from "@/lib/AxiosInstance";
import BackButton from "@/CustomComponent/BackButton";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";

export default function StudentProfile() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const headingRef = useRef(null);

  const student = state?.student;

  // Focus heading on mount for screen readers
  useEffect(() => {
    if (headingRef.current) headingRef.current.focus();
  }, []);

  const handleConversation = async () => {
    try {
      await axiosInstance.post("conversation/create", {
        memberId: student._id,
      });
      navigate("/teacher/messages");
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  if (!student) {
    return (
      <main className="text-center mt-10" role="alert">
        <p className="text-red-500">Student data not found.</p>
        <Button
          variant="link"
          className="mt-4 underline text-blue-500"
          onClick={() => navigate(-1)}
        >
          Go back
        </Button>
      </main>
    );
  }

  return (
    <main
      className="max-w-5xl mx-auto px-4 sm:px-6 py-8 bg-white rounded-xl shadow-md"
      aria-labelledby="student-profile-heading"
    >
      <BackButton className="mb-10" />

      {/* Profile Section */}
      <section className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10">
        <Avatar
          className="w-24 h-24 rounded-full overflow-hidden ring-3 ring-gray-500 shadow-sm"
          aria-label={`${student.firstName} ${student.lastName}'s profile picture`}
        >
          <AvatarImage
            src={student?.profileImg?.url || avatar}
            alt={`${student?.firstName} ${student?.lastName}'s profile`}
          />
          <AvatarFallback className="w-full h-full bg-gray-200 text-gray-600 text-xl font-semibold flex items-center justify-center rounded-full">
            {student?.firstName?.[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col justify-center text-center md:text-left">
          <h1
            id="student-profile-heading"
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold text-gray-800 flex flex-wrap justify-center md:justify-start gap-x-2 gap-y-1"
          >
            {student?.firstName} {student?.middleName && student.middleName}{" "}
            {student?.lastName}
          </h1>

          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span>{student?.email}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <time dateTime={new Date(student?.createdAt).toISOString()}>
                Joined: {new Date(student?.createdAt).toLocaleDateString()}
              </time>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-2 mt-4">
            <Button
              className="bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              onClick={handleConversation}
            >
              Message
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section
        className="flex items-center justify-center mb-10"
        aria-label="Student statistics"
      >
        <StudentProfileStatCard
          className="max-w-xs"
          icon={<School />}
          title="Enrolled Courses"
          value={student?.courses?.length || 0}
        />
      </section>

      {/* Course List */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        aria-labelledby="enrolled-courses-heading"
      >
        <h2
          id="enrolled-courses-heading"
          className="text-2xl font-semibold text-gray-900 col-span-full mb-4"
        >
          View Grade Book of Enrolled Courses
        </h2>

        {student?.courses?.map((course) => (
          <Link
            to={`/teacher/courseGrades/${id}/${course._id}`}
            key={course._id}
            className="group relative rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <div className="transform group-hover:scale-105 transition-transform duration-300">
              <StudentProfileCourseCard course={course} />
            </div>

            <div className="absolute inset-0 bg-blue-600 bg-opacity-80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-lg font-semibold">
                View Grade Book
              </span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
