import { useEffect, useContext } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { GlobalContext } from "../Context/GlobalProvider";
import { axiosInstance } from "../lib/AxiosInstance";

const CourseShareRedirect = () => {
  const { courseId, refCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useContext(GlobalContext);

  useEffect(() => {
    const ref = searchParams.get("ref");
    const utm_source = searchParams.get("utm_source");
    const utm_medium = searchParams.get("utm_medium");
    const utm_campaign = searchParams.get("utm_campaign");

    const trackingData = {
      courseId,
      ref,
      utm_source,
      utm_medium,
      utm_campaign,
    };

    // Store in localStorage as requested: Example key: course_share_ref
    if (ref) localStorage.setItem("course_share_ref", ref);
    if (utm_source) localStorage.setItem("course_share_utm_source", utm_source);
    if (utm_medium) localStorage.setItem("course_share_utm_medium", utm_medium);
    if (utm_campaign)
      localStorage.setItem("course_share_utm_campaign", utm_campaign);

    // Send to backend - tracking should never block navigation
    axiosInstance.post("course-share/track", trackingData).catch((err) => {
      console.error("Tracking failed:", err);
    });

    // Redirect logic
    if (user) {
      if (user.role === "teacher") {
        navigate(`/teacher/courses/courseDetail/${courseId}`);
      } else {
        // Student or other roles
        navigate(`/student/course/detail/${courseId}?refCode=${refCode}`);
      }
    } else {
      // Guest
      navigate(`/course/detail/${courseId}`);
    }
  }, [courseId, searchParams, user, navigate]);

  return null; // Redirect-only component
};

export default CourseShareRedirect;
