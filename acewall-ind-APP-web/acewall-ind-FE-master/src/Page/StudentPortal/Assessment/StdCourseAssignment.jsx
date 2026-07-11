"use client";

import { useEffect, useState, useMemo } from "react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Loader, Search, Filter, BookOpen, GraduationCap, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function StdCourseAssignment() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  
  const [selectedCourseName, setSelectedCourseName] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [allCourseNames, setAllCourseNames] = useState([]);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          "assessment/getAllassessmentforStudent"
        );
        const data = response.data; 

        const uniqueCoursesMap = {};
        const courseNamesSet = new Set();

        data.forEach((item) => {
          const course = item.course;
          if (course && course._id) {
            if (!uniqueCoursesMap[course._id]) {
              uniqueCoursesMap[course._id] = {
                _id: course._id,
                title: course.courseTitle,
                thumbnail: course.thumbnail?.url || "https://via.placeholder.com/300x170",
                semesterbased: course.semesterbased, 
                gradingSystem: course.gradingSystem || "Normal",
              };
            }
            courseNamesSet.add(course.courseTitle);
          }
        });

        setCourses(Object.values(uniqueCoursesMap));
        setAllCourseNames([...courseNamesSet].sort());
      } catch (error) {
        console.error("Error fetching student assessments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchText.toLowerCase());
      const matchesName = selectedCourseName === "all" || course.title === selectedCourseName;
      const matchesSemester = semesterFilter === "all" || 
        (semesterFilter === "semester" ? course.semesterbased === true : course.semesterbased === false);

      return matchesSearch && matchesName && matchesSemester;
    });
  }, [courses, searchText, selectedCourseName, semesterFilter]);

  const resetFilters = () => {
    setSearchText("");
    setSelectedCourseName("all");
    setSemesterFilter("all");
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-96 gap-4">
      <Loader className="animate-spin text-acewall-main" size={40} />
      <p className="text-gray-500 animate-pulse font-medium">Loading your assessments...</p>
    </div>
  );

  return (
    <main className="w-full px-4 py-6 min-h-screen">
      <h1 className="text-xl py-4 mb-6 pl-6 font-semibold bg-acewall-main text-white rounded-lg shadow-md">
        My Assessments by Course
      </h1>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-xl shadow-sm border mb-8 border-gray-100">
        <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold">
          <Filter size={18} className="text-acewall-main" />
          <span>Filter Your Courses</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
             <Search className="absolute left-3 top-3 text-gray-400" size={16} />
             <input
                type="text"
                placeholder="Search by title..."
                className="border rounded-lg pl-10 pr-3 py-2 w-full h-11 focus:ring-2 focus:ring-acewall-main outline-none border-gray-200"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
          </div>

          <Select value={selectedCourseName} onValueChange={setSelectedCourseName}>
            <SelectTrigger className="h-11 border-gray-200"><SelectValue placeholder="All Courses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Enrolled Courses</SelectItem>
              {allCourseNames.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={semesterFilter} onValueChange={setSemesterFilter}>
            <SelectTrigger className="h-11 border-gray-200"><SelectValue placeholder="Course Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="semester">Semester Based</SelectItem>
              <SelectItem value="chapter">Chapter Based</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
             <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
             <p className="text-gray-500 text-lg">No courses match your filters.</p>
             <button onClick={resetFilters} className="text-acewall-main font-semibold mt-4 hover:underline">
                Clear Filters
             </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <article key={course._id}>
              {/* ✅ Navigation link with State to pass Course Title to the detail page */}
              <Link 
                to={`/student/assessment/bycourse/${course._id}`} 
                state={{ courseTitle: course.title }}
                className="block group"
              >
                <Card className="h-full border-none shadow-md hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden bg-white ring-1 ring-gray-100 group-hover:ring-acewall-main/20">
                  
                  <AspectRatio ratio={16 / 9} className="bg-gray-100 overflow-hidden relative">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                  </AspectRatio>

                  <CardHeader className="p-5 space-y-4">
                    <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-acewall-main transition-colors line-clamp-2 leading-tight">
                        {course.title}
                    </CardTitle>

                    <div className="flex flex-wrap gap-2">
                      <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1.5 text-white shadow-sm ${course.semesterbased ? 'bg-blue-600' : 'bg-orange-500'}`}>
                        <GraduationCap size={12} />
                        {course.semesterbased ? "Semester based" : "Chapter based"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xs font-medium text-gray-400">Manage Assignments</span>
                        <div className="flex items-center text-acewall-main text-xs font-bold bg-green-50 group-hover:bg-acewall-main group-hover:text-white px-3 py-1.5 rounded-lg transition-all">
                          Open <ChevronRight size={14} className="ml-1" />
                        </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}