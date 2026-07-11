import { CourseContext } from "@/Context/CoursesProvider";
import { axiosInstance } from "@/lib/AxiosInstance";
import { format } from "date-fns";
import { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader } from "lucide-react";
import BackButton from "@/CustomComponent/BackButton";

const StudentSemesterDetail = () => {
  const { semesterId, courseId } = useParams();
  const { quarters } = useContext(CourseContext);
  const [allQuarter, setAllQuarter] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuarters = async () => {
      try {
        const res = await axiosInstance.get(
          `quarter/get/v2/${courseId}/${semesterId}`,
        );
        setAllQuarter(res.data.quarters);
      } catch (err) {
        console.error(err);
        setError(err.response.data.message || "Internal Server Error");
      } finally {
        setLoading(false);
      }
    };

    fetchQuarters();
  }, [semesterId, quarters]);

  if (loading) {
    return (
      <main
        className="flex justify-center items-center h-64"
        aria-labelledby="loading-title"
      >
        <Loader size={32} className="animate-spin text-blue-500" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="space-y-4" aria-labelledby="quarter-list-title">
        <h2
          id="quarter-list-title"
          className="text-lg font-semibold text-black"
        >
          Quarters
        </h2>
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="space-y-4" aria-labelledby="quarter-list-title">
      <div className="mb-4">
        <BackButton />
      </div>
      <h2 id="quarter-list-title" className="text-lg font-semibold text-black">
        Quarters
      </h2>

      {allQuarter?.length > 0 ? (
        allQuarter.map((quarter) => (
          <Link
            key={quarter._id}
            to={`/student/mycourses/${courseId}/chapters?quarterID=${quarter._id}&&semesterbased=true`}
            aria-label={`Go to chapters for Quarter ${quarter.title}`}
          >
            <div
              className="mb-4 border border-gray-200 p-5 rounded-lg bg-blue-50 hover:bg-blue-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
              role="button"
              tabIndex={0}
            >
              <h3 className="font-semibold text-md">
                Quarter: {quarter.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {format(new Date(quarter.startDate), "MMMM do, yyyy")} -{" "}
                {format(new Date(quarter.endDate), "MMMM do, yyyy")}
              </p>
            </div>
          </Link>
        ))
      ) : (
        <p className="text-sm text-muted-foreground" role="status">
          No quarters selected.
        </p>
      )}
    </main>
  );
};

export default StudentSemesterDetail;
