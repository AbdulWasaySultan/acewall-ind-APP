"use client";

import { useEffect, useState, useMemo } from "react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // ✅ Import Select components
import { Search, BookOpen, Loader2, Filter } from "lucide-react";

const AllannouncementCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("all"); // ✅ State for dropdown filter
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/course/getVerifiedCourses");
      const fetchedCourses = res.data.courses || [];

      const formattedCourses = fetchedCourses.map((course) => ({
        ...course,
        thumbnail: course.thumbnail?.url || "https://via.placeholder.com/300x170",
      }));

      setCourses(formattedCourses);
    } catch (err) {
      console.error("Error fetching verified courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // ✅ Updated filtering logic to handle both search text AND dropdown selection
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.courseTitle
        .toLowerCase()
        .includes(searchText.toLowerCase());
      
      const matchesDropdown = 
        selectedCourseId === "all" || course._id === selectedCourseId;

      return matchesSearch && matchesDropdown;
    });
  }, [courses, searchText, selectedCourseId]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-96 gap-4">
      <Loader2 className="animate-spin text-green-500" size={40} />
      <p className="text-gray-500 font-medium">Loading verified courses...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Course Announcements</h1>
          <p className="text-gray-500 mt-1">Select a verified course to manage announcements</p>
        </div>
      </div>

      {/* ✅ Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 items-end">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search by course title..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10 h-11 border-gray-200 focus-visible:ring-green-500 rounded-lg shadow-sm"
          />
        </div>

        {/* Course Dropdown Filter */}
        <div className="w-full md:w-64">
          <label className="text-xs font-semibold uppercase text-gray-400 mb-1.5 block px-1">
            Quick Filter
          </label>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="h-11 border-gray-200 focus:ring-green-500 rounded-lg bg-white shadow-sm">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-gray-400" />
                <SelectValue placeholder="Select a course" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verified Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.courseTitle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <BookOpen className="mx-auto text-gray-300 mb-4" size={56} />
          <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
          <p className="text-gray-400 mt-1">Try resetting your filters or adjusting your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <Card 
              key={course._id} 
              className="group cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-none shadow-md overflow-hidden bg-white"
              onClick={() => navigate(`/teacher/announcements/${course._id}`, {
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
                <div className="flex items-center justify-between mb-2">
                  {course.category?.title ? (
                    <span className="text-[10px] uppercase tracking-widest font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-md">
                      {course.category.title}
                    </span>
                  ) : <div className="h-4" />}
                </div>
                <CardTitle className="text-lg font-bold leading-tight text-gray-800 group-hover:text-green-600 transition-colors line-clamp-2">
                  {course.courseTitle}
                </CardTitle>
                <div className="pt-4 flex items-center text-sm font-semibold text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Announcements
                  <Search size={14} className="ml-2" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllannouncementCourses;