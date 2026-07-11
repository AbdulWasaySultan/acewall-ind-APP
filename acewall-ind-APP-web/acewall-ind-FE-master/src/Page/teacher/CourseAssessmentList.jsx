"use client";

import { useEffect, useState, useMemo } from "react";
import { BadgePlus, Library, Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function CourseAssessmentList() {
  const { id } = useParams(); // courseId
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await axiosInstance.get(
          "assessment/allAssessmentByTeacher"
        );
        const data = response.data;
        // Filter assessments by course ID
        const filtered = data.filter(
          (assessment) => assessment?.course?._id === id
        );
        setAssessments(filtered);

        // Extract unique categories for dropdown
        const categoriesSet = new Set(
          filtered.map((a) => a.category?.name).filter(Boolean)
        );
        setAllCategories([...categoriesSet]);
      } catch (error) {
        console.error("Error fetching assessments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [id]);

  // Filtered assessments based on type and category
  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      const matchesType =
        selectedType === "all" || assessment.type === selectedType;
      const matchesCategory =
        selectedCategory === "all" ||
        assessment.category?.name === selectedCategory;
      return matchesType && matchesCategory;
    });
  }, [assessments, selectedType, selectedCategory]);

  return (
    <main className="flex w-full min-h-screen " role="main">
      <div className="w-full mx-auto">
        <h1 className="text-xl py-4 mb-6 pl-6 font-semibold bg-acewall-main text-white rounded-lg">
          Assessments for this Course
        </h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          {/* Assessment Type */}
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger
              className="w-full md:w-1/3"
              aria-label="Assessment type filter"
            >
              {selectedType === "all" ? "All Types" : selectedType}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="chapter-assessment">
                Chapter Assessment
              </SelectItem>
              <SelectItem value="lesson-assessment">
                Lesson Assessment
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger
              className="w-full md:w-1/3"
              aria-label="Category filter"
            >
              {selectedCategory === "all" ? "All Categories" : selectedCategory}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin" />
          </div>
        ) : filteredAssessments.length === 0 ? (
          <p className="text-center text-gray-500">No assessments found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssessments.map((assessment) => (
              <Link
                key={assessment._id}
                to={`/teacher/assessments/allsubmissions/${assessment._id}`}
                className="focus-visible:ring-2 focus-visible:ring-green-500 rounded-lg outline-none"
              >
                <Card className="w-full border-gray-200 hover:border-green-300 transition-all duration-200 hover:shadow-md cursor-pointer">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                      {assessment?.title}
                    </h3>

                    <Badge variant="light" className="bg-green-100">
                      {assessment?.category?.name}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <BadgePlus className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 line-clamp-1">
                        {assessment?.course?.courseTitle}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {assessment?.chapter && (
                        <div className="flex items-center gap-1.5">
                          <Library className="h-4 w-4 text-green-500" />
                          <p className="text-xs text-gray-700 truncate">
                            {assessment?.chapter?.title}
                          </p>
                        </div>
                      )}

                      {assessment?.lesson && (
                        <div className="flex items-center gap-1.5">
                          <Library className="h-4 w-4 text-green-500" />
                          <p className="text-xs text-gray-700 truncate">
                            {assessment?.lesson?.title}
                          </p>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {assessment?.description}
                    </p>

                    <p className="text-xs text-gray-500">
                      Created:{" "}
                      {format(new Date(assessment.createdAt), "MMM d, yyyy")}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
