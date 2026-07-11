"use client";

import { useContext, useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  FileText,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { axiosInstance } from "@/lib/AxiosInstance";
import { GlobalContext } from "@/Context/GlobalProvider";
import { Link } from "react-router-dom";

export default function TeacherDashboard() {
  const [courses, setCourses] = useState();
  const [students, setStudents] = useState();
  const [postsCount, setPostsCount] = useState(0);
  const [courseStats, setCourseStats] = useState({
    verified: 0,
    pending: 0,
    rejected: 0
  });

  const { user } = useContext(GlobalContext);
  const teacherId = user?._id;

  // Courses (Recent & Verified Count assumption from dashboard endpoint)
  useEffect(() => {
    const getTeacherCourse = async () => {
      await axiosInstance("course/getTeacherCoursesForDesboard")
        .then((res) => {
          setCourses(res.data);
        })
        .catch((err) => {
          console.log(err, "courses error");
        });
    };
    getTeacherCourse();
  }, []);

  // Students
  useEffect(() => {
    const getTeacherstudents = async () => {
      await axiosInstance("/course/getallCoursesforTeacher")
        .then((res) => {
          setStudents(res.data.students);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    getTeacherstudents();
  }, []);

  // Course Stats (Pending & Rejected & Verified explicit fetch)
  useEffect(() => {
    const fetchCourseStats = async () => {
      try {
        const [pendingRes, rejectedRes, verifiedRes] = await Promise.all([
          axiosInstance.get("/course/getindividualcourse?isVerified=pending"),
          axiosInstance.get("/course/getindividualcourse?isVerified=rejected"),
          axiosInstance.get("/course/getindividualcourse?isVerified=approved")
        ]);

        setCourseStats({
          pending: pendingRes.data.courses?.length || 0,
          rejected: rejectedRes.data.courses?.length || 0,
          verified: verifiedRes.data.courses?.length || 0
        });
      } catch (error) {
        console.error("Error fetching course stats:", error);
      }
    };
    fetchCourseStats();
  }, []);


  // User Posts
  useEffect(() => {
    if (!teacherId) return;
    const fetchUserPosts = async () => {
      try {
        const response = await axiosInstance.get(`posts/specificUserPosts/${teacherId}`);
        setPostsCount(response.data.posts?.length || 0);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      }
    };
    fetchUserPosts();
  }, [teacherId]);

  const metrics = [
    {
      title: "Total Students",
      value: students?.length || 0,
      icon: <Users size={20} className="text-gray-700" />,
      link: "/teacher/allStudent",
      bgColor: "bg-gray-100",
    },
    {
      title: "Total Posts",
      value: postsCount,
      icon: <FileText size={20} className="text-gray-700" />,
      link: `/teacher/social/socialprofile/${teacherId}`,
      bgColor: "bg-gray-100",
    },
    {
      title: "Verified Courses",
      value: courseStats.verified,
      icon: <CheckCircle size={20} className="text-green-700" />,
      link: "/teacher/courses",
      bgColor: "bg-green-100",
      textColor: "text-green-900",
      iconContainerColor: "bg-green-200"
    },
    {
      title: "Pending Courses",
      value: courseStats.pending,
      icon: <Clock size={20} className="text-yellow-700" />,
      link: "/teacher/courses/unverifiedCourse",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-900",
      iconContainerColor: "bg-yellow-200"
    },
    {
      title: "Rejected Courses",
      value: courseStats.rejected,
      icon: <XCircle size={20} className="text-red-700" />,
      // Assuming a tab or page for rejected, linking to unverified for now as it has tabs
      link: "/teacher/courses/unverifiedCourse",
      bgColor: "bg-red-100",
      textColor: "text-red-900",
      iconContainerColor: "bg-red-200"
    }
  ];

  return (
    <div
      className="min-h-screen"
      role="main"
      aria-labelledby="dashboard-heading"
    >
      <h1
        id="dashboard-heading"
        className="text-xl py-4 mb-8 pl-6 font-semibold bg-acewall-main text-white rounded-lg"
      >
        Dashboard
      </h1>

      {/* Metrics */}
      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="sr-only">
          Dashboard metrics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {metrics.map((metric, i) => (
            <Link key={i} to={metric.link} className="block group">
              <Card
                className={`border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer ${metric.bgColor}`}
                role="region"
                aria-label={metric.title}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-sm font-medium ${metric.textColor || "text-gray-600"}`}>
                    {metric.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${metric.iconContainerColor || "bg-white/50"}`}>
                    {metric.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${metric.textColor || "text-gray-800"}`}
                    aria-live="polite"
                  >
                    {metric.value}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Courses */}
        <section aria-labelledby="recent-courses-heading">
          <h2
            id="recent-courses-heading"
            className="text-lg font-semibold mb-4"
          >
            Recent Courses
          </h2>

          <div className="space-y-4" aria-live="polite">
            {courses?.published?.slice(0, 3).map((course) => (
              <Link
                key={course._id}
                to={`/teacher/courses/courseDetail/${course._id}`}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg block"
                aria-label={`View course ${course.courseTitle}`}
              >
                <article className="flex items-start gap-4 bg-white p-4 rounded-lg border hover:shadow transition-shadow">
                  <img
                    src={course?.thumbnail.url || "/placeholder.svg"}
                    alt={`Thumbnail for ${course?.courseTitle}`}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-sm mb-1">
                      {course?.courseTitle}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {course?.category?.title}
                    </span>
                  </div>
                </article>
              </Link>
            ))}
            {(!courses?.published || courses.published.length === 0) && (
              <p className="text-sm text-gray-500">No recent courses found.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
