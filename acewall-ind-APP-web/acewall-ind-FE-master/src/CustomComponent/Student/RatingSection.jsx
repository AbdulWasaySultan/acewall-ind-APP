import React, { useContext, useEffect, useState } from "react";
import RatingStars from "../RatingStars";
import { Loader, Star } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";
import { GlobalContext } from "@/Context/GlobalProvider";

const RatingSection = ({ course, id }) => {
  const { user } = useContext(GlobalContext);
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [courseRating, setCourseRating] = useState();
  const [loading, setLoading] = useState(false);

  const fetchUserRating = async () => {
    setLoading(true);
    await axiosInstance
      .get(`rating/isRated/${course._id}`)
      .then((res) => {
        console.log(res);
        setHasRated(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err, "err");
        setLoading(false);
      });
  };
  const fetchCourseRating = async () => {
    setLoading(true);
    await axiosInstance
      .get(`rating/course/${course._id}`)
      .then((res) => {
        setLoading(false);
        console.log(res, "whole course rating");
        setCourseRating(res.data);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err, "err is fetching course rating");
      });
  };

  useEffect(() => {
    fetchUserRating();
    fetchCourseRating();
  }, [id]);

  const handleRatingSubmit = async (rating) => {
    if (hasRated) {
      toast.error("You have already rated this course.");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post(`rating/create/${course._id}`, {
        star: rating,
      });
      toast.success(res.data.message);
      setUserRating(rating);
      setHasRated(true);
      setLoading(false);
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Failed to submit rating");
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-gray-50 p-6 rounded-lg position-relative ${user?.role === "teacherAsStudent"
        ? "opacity-50 pointer-events-none"
        : ""
        }`}
    >

      <h3 className="text-xl font-bold mb-4 ">Rate this course</h3>
      {user?.role === "teacherAsStudent" && (
        <div className="position-absolute opacity-200 z-10">
          <p className="text-sm text-red-500 mb-2">
            You are not allowed to rate your own course.
          </p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center ">
        {loading ? (
          <Loader className="animate-spin" />
        ) : hasRated && hasRated.rating ? (
          <>
            {[...Array(hasRated.star)].map((_, i) => (
              <Star
                key={i}
                className="h-5 w-5 fill-yellow-500 text-yellow-500"
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">
              You rated this course {hasRated.star} star
              {hasRated.star > 1 ? "s" : ""}
            </span>
          </>
        ) : (
          <>
            <RatingStars
              rating={userRating}
              setRating={handleRatingSubmit}
              editable={true}
            />
            <p className="text-sm text-gray-500 ml-4">
              {userRating > 0 ? "Thanks for rating!" : "Click to rate"}
            </p>
          </>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${star <= Math.round(courseRating?.averageStar)
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-gray-300"
                  }`}
              />
            ))}
          </div>
          <span className="font-medium">
            {courseRating?.averageStar?.toFixed(1)}
          </span>
          <span className="text-gray-500">
            ({courseRating?.count} ratings)
          </span>
        </div>
      </div>
    </div>
  );
};

export default RatingSection;
