import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import {
  BookOpen,
  Calendar,
  Globe,
  Code,
  AlertCircle,
  Loader,
  Search,
} from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { GlobalContext } from "@/Context/GlobalProvider";

const DEBOUNCE_DELAY = 800;

const AllCoursesFilterPage = ({ pagefor, link }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCourses, setTotalCourses] = useState(0);
  const [searchText, setSearchText] = useState("");
  const { user } = useContext(GlobalContext);

  const debounceRef = useRef(null);

  console.log(debounceRef, "debounceRef");

  const fetchCourses = useCallback(async (searchValue) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.get(
        `/course/getUserCoursesforFilter?search=${searchValue}`
      );

      setCourses(res.data.courses || []);
      setTotalCourses(res.data.totalCourses || 0);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced effect
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchCourses(searchText);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(debounceRef.current);
  }, [searchText, fetchCourses]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader className="animate-spin text-green-700" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">
                  Error Loading Courses
                </h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button
                  onClick={() => fetchCourses(searchText)}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Courses</h1>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md my-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            type="text"
            placeholder="Search my courses..."
            value={searchText}
            onChange={handleSearch}
            className="pl-10 h-11 focus-visible:ring-blue-600"
          />
        </div>

        {/* Courses */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No courses found
            </h3>
            <p className="text-gray-500">Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  {course.thumbnail?.url ? (
                    <img
                      src={course.thumbnail.url}
                      alt={course.courseTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="h-16 w-16 text-white opacity-50" />
                    </div>
                  )}

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        course.published
                          ? "bg-green-500 text-white"
                          : "bg-yellow-500 text-white"
                      }`}
                    >
                      {course.published ? "Published" : "Unpublished"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {course.courseTitle}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Code className="h-4 w-4 mr-2 text-indigo-500" />
                      <span className="font-mono font-semibold">
                        {course.courseCode}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.category?.name && (
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                        {course.category.name}
                      </span>
                    )}
                    {course.subcategory?.name && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {course.subcategory.name}
                      </span>
                    )}
                  </div>

                  <Link
                    to={
                      pagefor == "Discussions" && user.role === "teacher"
                        ? link +
                          course._id +
                          `?type=course&&typeId=${course._id}&&course=${course._id}`
                        : link + course._id
                    }
                  >
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                      View {pagefor}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCoursesFilterPage;
