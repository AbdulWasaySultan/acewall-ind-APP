"use client";

import { useEffect, useState, useMemo, useContext } from "react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "@/Context/GlobalProvider";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Loader2, Filter, Bell } from "lucide-react";

const AllannouncementCoursesStd = () => {
  const { user } = useContext(GlobalContext); // ✅ Get logged in student info
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const navigate = useNavigate();

  const fetchEnrolledCourses = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      // ✅ Call your specific route with studentId
      const res = await axiosInstance.get(`/announcements/getbystudent/${user._id}`);
      const announcements = res.data.announcements || [];

      // Extract unique courses from the student's announcement feed
      const courseMap = new Map();
      announcements.forEach((ann) => {
        if (ann.course && !courseMap.has(ann.course._id)) {
          courseMap.set(ann.course._id, {
            _id: ann.course._id,
            courseTitle: ann.course.courseTitle,
            thumbnail: ann.course.thumbnail?.url || "https://via.placeholder.com/300x170",
          });
        }
      });

      setCourses(Array.from(courseMap.values()));
    } catch (err) {
      console.error("Error fetching student courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, [user?._id]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.courseTitle.toLowerCase().includes(searchText.toLowerCase());
      const matchesDropdown = selectedCourseId === "all" || course._id === selectedCourseId;
      return matchesSearch && matchesDropdown;
    });
  }, [courses, searchText, selectedCourseId]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-96 gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-gray-500 font-medium">Fetching your courses...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Announcements</h1>
        <p className="text-gray-500 mt-1">Select a course to see updates from your teachers.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10 items-end">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search my courses..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10 h-11 focus-visible:ring-blue-600"
          />
        </div>

        <div className="w-full md:w-64">
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="h-11 bg-white">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-gray-400" />
                <SelectValue placeholder="Filter by Course" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Enrolled Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course._id} value={course._id}>{course.courseTitle}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <Bell className="mx-auto text-gray-300 mb-4" size={56} />
          <h3 className="text-lg font-medium text-gray-900">No Announcements</h3>
          <p className="text-gray-400 mt-1">There are no updates for your courses right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <Card 
              key={course._id} 
              className="group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-none shadow-md overflow-hidden bg-white"
              onClick={() => navigate(`/student/announcements/${course._id}`, {
                state: { courseTitle: course.courseTitle }
              })}
            >
              <AspectRatio ratio={16 / 9} className="overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.courseTitle}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
              </AspectRatio>
              <CardHeader className="p-5">
                <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {course.courseTitle}
                </CardTitle>
                <div className="pt-4 flex items-center text-sm font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Check Updates →
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllannouncementCoursesStd;