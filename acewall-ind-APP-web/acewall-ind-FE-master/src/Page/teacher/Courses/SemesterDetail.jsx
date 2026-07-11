import { CourseContext } from "@/Context/CoursesProvider";
import BackButton from "@/CustomComponent/BackButton";
import { axiosInstance } from "@/lib/AxiosInstance";
import { format } from "date-fns";
import { Loader, Calendar } from "lucide-react";
import React, { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";

const SemesterDetail = () => {
  const { id, courseId } = useParams();
  const { quarters } = useContext(CourseContext);
  const [allQuarter, setallQuarter] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuarters = async () => {
      try {
        const res = await axiosInstance.get(`quarter/get/${id}`);
        setallQuarter(res.data.quarters);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error("Failed to fetch quarters:", err);
      }
    };
    fetchQuarters();
  }, [id, quarters]);

  return (
    <main className="space-y-4" id="main-content">
      <div className="flex items-center gap-2">
        <BackButton />
        <h1 className="text-xl font-bold text-black">Semester Details</h1>
      </div>

      <div className="w-full border-b pb-2">
        <h2 className="text-lg font-semibold text-gray-800">Quarters List</h2>
        <p className="text-sm text-gray-600">Select a quarter to manage chapters.</p>
      </div>

      {loading ? (
        <div 
          className="flex flex-col justify-center items-center py-10" 
          aria-live="polite" 
          aria-busy="true"
        >
          <Loader className="animate-spin h-8 w-8 text-blue-600" />
          <span className="sr-only">Loading quarters...</span>
        </div>
      ) : (
        <nav aria-label="Quarters navigation">
          {allQuarter?.length > 0 ? (
            <div className="grid gap-4">
              {allQuarter.map((quarter) => (
                <Link
                  key={quarter._id}
                  to={`/teacher/courses/${courseId}/chapters?quarterID=${quarter._id}&&semesterbased=true`}
                  className="block group rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <div
                    className="border border-gray-200 p-5 rounded-lg bg-blue-50 group-hover:bg-blue-100 group-hover:border-blue-300 transition-colors shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-md text-blue-900">
                          Quarter: {quarter.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 text-gray-600">
                          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                          <p className="text-xs font-medium">
                            {format(new Date(quarter.startDate), "MMMM do, yyyy")} — {" "}
                            {format(new Date(quarter.endDate), "MMMM do, yyyy")}
                          </p>
                        </div>
                      </div>
                      <span className="sr-only">Click to view chapters for {quarter.title}</span>
                      <div className="text-blue-600 group-hover:translate-x-1 transition-transform" aria-hidden="true">
                        →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 p-8 rounded-lg text-center" role="status">
              <p className="text-gray-600 font-medium">
                No quarters found for this semester.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Please add quarters to this course before adding chapters.
              </p>
            </div>
          )}
        </nav>
      )}
    </main>
  );
};

export default SemesterDetail;