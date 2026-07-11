import {
  Assignment,
  DeshboardAnnouncementCard,
  DeshBoardCourseCard,
} from "@/CustomComponent/Card";
import { axiosInstance } from "@/lib/AxiosInstance";
import React, { useEffect, useState } from "react";
import { Video, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activeMeetings, setActiveMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getCourses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("enrollment/studentCourses");
      setCourses(res.data.enrolledCourses);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await axiosInstance.get(`/announcements/getbystudent/${user?._id}`);
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchActiveMeetings = async () => {
    try {
      const res = await axiosInstance.get("/zoom/active");
      setActiveMeetings(res.data || []);
    } catch (err) {
      console.error("Error fetching active meetings", err);
    }
  };

  useEffect(() => {
    getCourses();
    fetchAnnouncements();
    fetchActiveMeetings();

    // 🔄 Refresh active meetings every 30 seconds
    const interval = setInterval(fetchActiveMeetings, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main aria-labelledby="dashboard-title" className="p-4">
      <header>
        <h1
          id="dashboard-title"
          className="text-xl py-4 mb-8 pl-6 font-semibold bg-acewall-main text-white rounded-lg"
        >
          Dashboard
        </h1>
      </header>

      {/* 🔴 LIVE CLASS BANNER */}
      {activeMeetings.length > 0 && (
        <div className="mb-8 space-y-4">
          {activeMeetings.map((m) => (
            <div
              key={m._id}
              className="bg-red-50 border-2 border-red-500 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-lg ring-2 ring-red-200"
            >
              <div className="flex items-center gap-4">
                <div className="bg-red-500 p-3 rounded-full animate-pulse">
                  <Video className="text-white" size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-bold text-xs uppercase tracking-wider animate-pulse">
                      • Live Now
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 line-clamp-1">
                      {m.topic}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600">
                    Course: <span className="font-semibold">{m.course?.courseTitle}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Button
                  className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-6 rounded-lg text-lg flex items-center gap-2 shadow-xl shadow-red-100 transition-transform active:scale-95"
                  onClick={() => navigate(`/student/mycourses/live-list/${m.course?._id || m.course}`)}
                >
                  <Play size={20} fill="white" /> JOIN CLASS NOW
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <section
        aria-label="Dashboard content sections"
        className="grid sm:grid-cols-1 lg:grid-cols-2 grid-rows-1 gap-6"
      >
        {/* Announcement Card */}
        <div
          role="region"
          aria-labelledby="announcements-heading"
        >
          <h2 id="announcements-heading" className="sr-only">
            Announcements
          </h2>

          <DeshboardAnnouncementCard
            mainHeading="Announcements"
            data={announcements}
            width="max-w-1/2"
            height={"h-auto"}
            link={"AnnouncementsCoursesStd"}
          />
        </div>

        {/* Courses Card */}
        <div
          role="region"
          aria-labelledby="courses-heading"
          aria-busy={loading}
          aria-live="polite"
        >
          <h2 id="courses-heading" className="sr-only">
            My Courses
          </h2>

          <DeshBoardCourseCard
            mainHeading="My courses"
            data={courses}
            link={"mycourses"}
            width="max-w-1/2"
          />

          {loading && (
            <p className="text-sm text-gray-600 mt-2" role="status">
              Loading courses…
            </p>
          )}
        </div>
      </section>
    </main>
  );
};

export default Dashboard;