"use client";

import { useEffect, useState, useMemo } from "react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const AllStdCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/course/getallCoursesforTeacher");
      const students = res.data.students || [];

      // Extract unique courses
      const uniqueCourses = [];
      students.forEach((student) => {
        (student.courses || []).forEach((course) => {
          if (!uniqueCourses.some((c) => c._id === course._id)) {
            uniqueCourses.push({
              ...course,
              thumbnail: course.thumbnail?.url || "https://via.placeholder.com/300x170",
            });
          }
        });
      });

      setCourses(uniqueCourses);
    } catch (err) {
      console.error(err);
      alert("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.courseTitle
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesDropdown = selectedCourse === "All" || course._id === selectedCourse;
      return matchesSearch && matchesDropdown;
    });
  }, [courses, searchText, selectedCourse]);

  if (loading) return <p className="text-center mt-10">Loading courses...</p>;
  if (courses.length === 0) return <p className="text-center mt-10">No courses found.</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Courses</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/2"
        />

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/2"
        >
          <option value="All">All Courses</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.courseTitle}
            </option>
          ))}
        </select>
      </div>

      {/* Course cards */}
      {filteredCourses.length === 0 ? (
        <p className="text-center text-gray-500">No courses match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCourses.map((course) => (
            <article key={course._id} role="listitem">
              <div
                className="cursor-pointer hover:shadow-lg transition-shadow rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                onClick={() =>
                  navigate(`/teacher/course/${course._id}`, {
                    state: { courseTitle: course.courseTitle },
                  })
                }
              >
                <Card className="overflow-hidden w-full pb-4 pt-0">
                  <AspectRatio ratio={16 / 9}>
                    <img
                      src={course.thumbnail}
                      alt={course.courseTitle}
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>

                  <CardHeader className="space-y-2 px-4 pt-3">
                    {course.category?.title && (
                      <div className="uppercase text-indigo-600 bg-indigo-100 text-xs font-medium w-fit px-2 rounded">
                        {course.category.title}
                      </div>
                    )}
                    <CardTitle>
                      <h3 className="text-lg font-semibold text-gray-800">{course.courseTitle}</h3>
                    </CardTitle>
                    {course.createdby?.firstName && (
                      <p className="text-xs text-muted-foreground">
                        <span className="sr-only">Instructor:</span>
                        Teacher: {course.createdby.firstName}
                      </p>
                    )}
                  </CardHeader>

                  {course.language && (
                    <CardContent className="px-4 pt-0">
                      <p className="text-sm text-muted-foreground">
                        <span className="sr-only">Course language:</span>
                        Language: {course.language}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllStdCourses;
