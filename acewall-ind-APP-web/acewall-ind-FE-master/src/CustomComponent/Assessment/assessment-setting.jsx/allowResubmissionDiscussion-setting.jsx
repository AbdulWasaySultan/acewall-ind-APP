import { axiosInstance } from "@/lib/AxiosInstance";
import { Loader } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const AllowResubmissionInDiscussion = ({
  fetchAssessment,
  allowDiscussion,
  setAllowDiscussion,
  discussionId,
}) => {
  const [loading, setLoading] = useState(false);

  const handleAllowDiscussion = async () => {
    const newValue = !allowDiscussion;
    setAllowDiscussion(newValue);

    try {
      const res = await axiosInstance.put(
        `discussion/toggleAllowResubmission/${discussionId}`,
        { allowResubmission: newValue },
      );
      fetchAssessment();
      setAllowDiscussion(res.data.allowResubmission);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update discussion setting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center w-full h-screen"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2">
          <Loader size={20} />
          <p className="text-sm text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-5">
        <div className="mt-6 flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
          <input
            type="checkbox"
            id="discussion"
            checked={allowDiscussion}
            onChange={handleAllowDiscussion}
            className="w-5 h-5 cursor-pointer accent-blue-600"
          />
          <label
            htmlFor="discussion"
            className="font-medium cursor-pointer select-none"
          >
            Allow Discussion
          </label>
          <p className="text-sm text-gray-500 ml-auto">
            {allowDiscussion
              ? "Students can participate in discussions."
              : "Discussion disabled for this assessment."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AllowResubmissionInDiscussion;
