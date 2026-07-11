import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SearchBox from "@/CustomComponent/SearchBox";
import { useContext, useEffect, useState } from "react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { GlobalContext } from "@/Context/GlobalProvider";
import { MyCoursesCard } from "@/CustomComponent/Card";
import { Loader, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FILTER_TYPES = [
  { label: "All", value: "all" },
  { label: "One-Time", value: "ONETIME" },
  { label: "Subscription", value: "SUBSCRIPTION" },
  { label: "Free", value: "FREE" },
];

const SUB_STATUSES = [
  { label: "Active", value: "active" },
  { label: "Trial", value: "trial" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Past Due", value: "pastdue" },
];

const CourseCards = () => {
  const [enrollment, setEnrollment] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("all");
  const [activeStatus, setActiveStatus] = useState(null);
  const [counts, setCounts] = useState(null);
  const { user } = useContext(GlobalContext);

  const searching = searchQuery.trim() !== "";

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const fetchCourses = async () => {
        setLoading(true);
        try {
          const params = { search: searchQuery };
          if (activeType !== "all") {
            params.type = activeType;
          }
          if (activeType === "SUBSCRIPTION" && activeStatus) {
            params.status = activeStatus;
          }
          const res = await axiosInstance.get("/enrollment/studentCourses", {
            params,
          });
          setEnrollment(res.data.enrolledCourses || []);
          if (res.data.metadata?.counts) {
            setCounts(res.data.metadata.counts);
          }
        } catch (error) {
          console.error("Error fetching courses:", error);
          setEnrollment([]);
        } finally {
          setLoading(false);
        }
      };

      fetchCourses();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeType, activeStatus]);

  const handleTypeChange = (type) => {
    setActiveType(type);
    if (type !== "SUBSCRIPTION") {
      setActiveStatus(null);
    }
  };

  const clearFilters = () => {
    setActiveType("all");
    setActiveStatus(null);
    setSearchQuery("");
  };

  const hasActiveFilters = activeType !== "all" || activeStatus || searching;

  const getCountForType = (type) => {
    if (!counts) return null;
    if (type === "all") {
      return (
        (counts.onetime || 0) +
        (counts.free || 0) +
        (counts.subscription?.total || 0)
      );
    }
    if (type === "ONETIME") return counts.onetime || 0;
    if (type === "FREE") return counts.free || 0;
    if (type === "SUBSCRIPTION") return counts.subscription?.total || 0;
    return null;
  };

  return (
    <section className="p-3 md:p-0" aria-labelledby="my-courses-heading">
      <div className="flex flex-col pb-5 gap-5 mb-4">
        <div>
          <h1
            className="text-xl py-4 mb-4 pl-6 font-semibold bg-acewall-main text-white rounded-lg"
            id="my-courses-heading"
          >
            My Courses
          </h1>
        </div>
        <SearchBox
          query={searchQuery}
          setQuery={setSearchQuery}
          aria-label="Search my enrolled courses"
        />
      </div>

      {/* Filter Bar */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_TYPES.map((filter) => {
            const count = getCountForType(filter.value);
            return (
              <button
                key={filter.value}
                onClick={() => handleTypeChange(filter.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  activeType === filter.value
                    ? "bg-[var(--color-acewall-blue)] text-white border-[var(--color-acewall-blue)] shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                }`}
              >
                {filter.label}
                {count !== null && (
                  <span
                    className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                      activeType === filter.value
                        ? "bg-white/20 text-white"
                        : "bg-blue-100 text-blue-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 rounded-full text-sm font-medium text-red-500 hover:bg-red-50 border border-red-200 flex items-center gap-1 transition-all duration-200"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {/* Subscription Sub-filters */}
        {activeType === "SUBSCRIPTION" && (
          <div className="flex flex-wrap items-center gap-2 pl-2 border-l-2 border-green-300 ml-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mr-1">
              Status:
            </span>
            {SUB_STATUSES.map((status) => (
              <button
                key={status.value}
                onClick={() =>
                  setActiveStatus(
                    activeStatus === status.value ? null : status.value,
                  )
                }
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                  activeStatus === status.value
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {status.label}
                {counts?.subscription?.[status.value] !== undefined && (
                  <span
                    className={`ml-1 text-[10px] px-1 py-0.5 rounded-full ${
                      activeStatus === status.value
                        ? "bg-white/20"
                        : "bg-gray-100"
                    }`}
                  >
                    {counts.subscription[status.value]}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading State: Uses role="status" and aria-live="polite" */}
      {loading ? (
        <div
          className="flex justify-center items-center py-10"
          role="status"
          aria-live="polite"
        >
          <Loader className="animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading courses...</span>
        </div>
      ) : enrollment.length === 0 ? (
        // Empty State: Uses role="status" and aria-live="polite"
        <div
          className="flex flex-col items-center justify-center text-center px-4"
          role="status"
          aria-live="polite"
        >
          {searching || activeType !== "all" ? (
            <>
              <p className="text-2xl font-semibold text-muted-foreground">
                {searching ? (
                  <>
                    No course found for{" "}
                    <span className="font-bold">"{searchQuery}"</span>
                  </>
                ) : (
                  "No courses found for this filter"
                )}
              </p>
              <p className="text-md mt-4 text-muted-foreground">
                {searching
                  ? "Try a different keyword or explore all courses."
                  : "Try changing the filter or explore all courses."}
              </p>
              <Button
                className="mt-6 bg-green-500 text-white hover:bg-green-600"
                onClick={clearFilters}
                aria-label="Clear all filters"
              >
                Clear Filters
              </Button>
            </>
          ) : (
            <>
              {/* Using a structural <p> tag for the main empty message */}
              <p className="text-2xl font-semibold text-muted-foreground">
                Kickstart your learning journey
              </p>
              <p className="text-lg text-muted-foreground mt-2">
                When you enroll in a course, it will appear here.
              </p>
            </>
          )}
        </div>
      ) : (
        // Course Grid: Uses role="list" implicitly, but explicit ARIA can help
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label={
            searching ? `Search results for ${searchQuery}` : "Enrolled courses"
          }
        >
          {enrollment.map((course, index) => (
            // Course Link: Ensures the entire card is focusable and acts as a link
            <Link
              key={course._id || index}
              to={`/student/mycourses/${course._id}?courseId=${course.course._id}`}
              role="listitem" // Explicitly mark as a list item
              aria-label={`Go to course: ${course.course.courseTitle || "Untitled Course"}`}
            >
              <MyCoursesCard course={course} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default CourseCards;
