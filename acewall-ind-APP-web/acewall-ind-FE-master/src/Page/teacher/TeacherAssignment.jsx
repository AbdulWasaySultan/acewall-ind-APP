"use client";

import { useEffect, useState, useMemo } from "react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Loader, Search, Filter, CheckCircle, Clock, XCircle, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function TeacherAssessmentByCourse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  
  const [selectedCourseName, setSelectedCourseName] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  
  const [allCourseNames, setAllCourseNames] = useState([]);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await axiosInstance.get(
          "assessment/allAssessmentByTeacher"
        );
        const data = response.data;

        const uniqueCourses = [];
        const courseNamesSet = new Set();

        data.forEach((item) => {
          if (item.course?._id) {
            if (!uniqueCourses.some((c) => c._id === item.course._id)) {
              uniqueCourses.push({
                _id: item.course._id,
                title: item.course.courseTitle,
                thumbnail: item.course.thumbnail?.url || "https://via.placeholder.com/300x170",
                isVerified: item.course.isVerified, 
                semesterbased: item.course.semesterbased, 
                gradingSystem: item.course.gradingSystem,
              });
            }
            courseNamesSet.add(item.course.courseTitle);
          }
        });

        setCourses(uniqueCourses);
        setAllCourseNames([...courseNamesSet].sort());
      } catch (error) {
        console.error("Error fetching assessments:", error);
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
      const matchesVerification = verificationFilter === "all" || course.isVerified === verificationFilter;
      const matchesSemester = semesterFilter === "all" || 
        (semesterFilter === "semester" ? course.semesterbased === true : course.semesterbased === false);

      return matchesSearch && matchesName && matchesVerification && matchesSemester;
    });
  }, [courses, searchText, selectedCourseName, verificationFilter, semesterFilter]);

  const resetFilters = () => {
    setSearchText("");
    setSelectedCourseName("all");
    setVerificationFilter("all");
    setSemesterFilter("all");
  };

  return (
    <main className="w-full px-2 min-h-screen">
      <h1 className="text-xl py-4 mb-6 pl-6 font-semibold bg-acewall-main text-white rounded-lg shadow-md">
        Assessments by Course
      </h1>

      {/* --- Filter Bar --- */}
      <div className="bg-white p-5 rounded-xl shadow-sm border mb-8 border-gray-100">
        <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold">
          <Filter size={18} className="text-acewall-main" />
          <span>Advanced Search Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
             <Search className="absolute left-3 top-3 text-gray-400" size={16} />
             <input
                type="text"
                placeholder="Find a course..."
                className="border rounded-lg pl-10 pr-3 py-2.5 w-full focus:ring-2 focus:ring-acewall-main outline-none transition-all border-gray-200"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
          </div>

          <Select value={selectedCourseName} onValueChange={setSelectedCourseName}>
            <SelectTrigger className="h-11 border-gray-200"><SelectValue placeholder="All Courses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Every Course</SelectItem>
              {allCourseNames.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={verificationFilter} onValueChange={setVerificationFilter}>
            <SelectTrigger className="h-11 border-gray-200"><SelectValue placeholder="Verification Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verification Status</SelectItem>
              <SelectItem value="approved">Approved ✅</SelectItem>
              <SelectItem value="pending">Pending ⏳</SelectItem>
              <SelectItem value="rejected">Rejected ❌</SelectItem>
            </SelectContent>
          </Select>

          <Select value={semesterFilter} onValueChange={setSemesterFilter}>
            <SelectTrigger className="h-11 border-gray-200"><SelectValue placeholder="Course Structure" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Structures</SelectItem>
              <SelectItem value="semester">Semester Based</SelectItem>
              <SelectItem value="quarter">Course based </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 space-y-4">
          <Loader className="animate-spin text-acewall-main" size={40} />
          <p className="text-gray-500 animate-pulse">Gathering your assessments...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
             <p className="text-gray-500 text-lg">No courses match those filters.</p>
             <button 
                onClick={resetFilters}
                className="text-acewall-main font-semibold mt-4 hover:underline flex items-center gap-2 mx-auto"
             >
                <XCircle size={16} /> Reset All Filters
             </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <article key={course._id}>
              <Link
                to={`/teacher/assessments/bycourse/${course._id}`}
                className="block group"
              >
                <Card className="h-full border-none shadow-md hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden bg-white">
                  
                  <AspectRatio ratio={16 / 9} className="bg-gray-100 overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                    />
                  </AspectRatio>

                  <CardHeader className="p-5 space-y-4">
                    <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-acewall-main transition-colors line-clamp-2 leading-tight">
                        {course.title}
                    </CardTitle>

                    {/* ✅ Badges moved here: Below the Title */}
                    <div className="flex flex-wrap gap-2">
                      {/* Verification Badge */}
                      <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1.5 text-white
                        ${course.isVerified === 'approved' ? 'bg-[var(--color-acewall-green)]' : 
                          course.isVerified === 'rejected' ? 'bg-red-600' : 'bg-amber-500'}`}
                      >
                        {course.isVerified === 'approved' ? <CheckCircle size={12} /> : 
                         course.isVerified === 'rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                        {course.isVerified}
                      </div>

                      {/* Semester Badge */}
                      <div className="bg-blue-600 text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1.5">
                        <GraduationCap size={12} />
                        {course.semesterbased ? "Semester based" : "Chapter based"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <span className="text-xs font-medium text-gray-500">Grading: {course.gradingSystem}</span>
                        <div className="text-acewall-main text-xs font-bold bg-blue-50 px-3 py-1 rounded-md">
                          View Assessments →
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