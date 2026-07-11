import { useState } from "react";
import { Star } from "lucide-react";

export default function RatingStars({ rating, setRating, editable = false }) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseOver = (index) => {
    if (!editable) return;
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (!editable) return;
    setHoverRating(0);
  };

  const handleClick = (index) => {
    if (!editable) return;
    setRating(index);
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-6 w-6 cursor-pointer ${
            (hoverRating || rating) >= star
              ? "fill-yellow-500 text-yellow-500"
              : "text-gray-300"
          }`}
          onMouseOver={() => handleMouseOver(star)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(star)}
        />
      ))}
    </div>
  );
}
