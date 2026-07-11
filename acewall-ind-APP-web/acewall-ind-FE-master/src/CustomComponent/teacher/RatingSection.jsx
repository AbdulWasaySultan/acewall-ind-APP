import { axiosInstance } from "@/lib/AxiosInstance";
import { Star } from "lucide-react";
import React, { useEffect, useState } from "react";

const RatingSection = ({ courseId }) => {
  const [courseRating, setCourseRating] = useState(null);

  useEffect(() => {
    const fetchCourseRating = async () => {
      const response = await axiosInstance
        .get(`/rating/course/${courseId}`)
        .then((res) => {
          console.log(res);
          setCourseRating(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
      setCourseRating(response.data);
    };

    fetchCourseRating();
  }, [courseId]);

  return (
    <div className="my-10">
      <h3 className="text-lg font-medium mb-4">Overall Course Rating</h3>
      <div className="bg-green-50 p-8 rounded-lg flex flex-col items-center">
        {courseRating ? (
          <>
            <div className="text-5xl font-semibold mb-4">
              {(courseRating.averageStar || 4.8).toFixed(1)}
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star, index) => {
                return (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(courseRating?.averageStar)
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                );
              })}
            </div>
            <section className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                ({courseRating?.count || 0}{" "}
                {courseRating?.count === 1 ? "Rating" : "Ratings"})
              </div>
            </section>
          </>
        ) : (
          <div className="text-lg font-medium text-gray-500">
            No ratings available
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingSection;
