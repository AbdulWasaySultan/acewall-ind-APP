import React, { useEffect, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, Loader2, AlertCircle } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useParams } from "react-router-dom";

// Destructure 'id' from props
const EnrollmentStats = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");
  const [error, setError] = useState(null);
  console.log(id, "course id");

  const fetchStats = useCallback(async () => {
    // Use 'id' here, not 'courseId'
    if (!id) {
      console.warn("No id provided to EnrollmentStats");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Adjusted endpoint to match your routing
      const response = await axiosInstance.get(`/course/stats/${id}`, {
        params: { range },
      });

      if (response.data?.success) {
        // Ensure data is always an array to avoid .length errors
        setData(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("API ERROR:", err.response || err.message);
      setError("Could not load enrollment data.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [id, range]); // Depend on 'id'

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
            <Calendar className="text-green-600" size={20} />
            Enrollment Trends
          </h2>
          <p className="text-sm text-gray-500">Overview of student sign-ups</p>
        </div>

        <div className="flex bg-gray-100 dark:bg-neutral-800 p-1 rounded-lg">
          {["7d", "30d", "6m", "all"].map((val) => (
            <button
              key={val}
              onClick={() => setRange(val)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition uppercase ${
                range === val
                  ? "bg-white dark:bg-neutral-700 shadow-sm text-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full relative">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mb-2 text-green-600" />
            <p className="text-xs animate-pulse">Fetching analytics...</p>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-red-500 italic text-sm">
            <AlertCircle size={20} className="mb-1" />
            {error}
          </div>
        ) : Array.isArray(data) && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickMargin={10}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="students"
                stroke="#16a34a"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorStudents)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 dark:border-neutral-800 rounded-xl text-sm">
            No enrollment data found for this period.
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentStats;
