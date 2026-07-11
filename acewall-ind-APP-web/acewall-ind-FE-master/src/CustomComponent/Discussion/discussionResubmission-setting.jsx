import { axiosInstance } from "@/lib/AxiosInstance";
import { Loader } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const DiscussionAllowResubmissionSetting = ({
  fetchDiscussion,
  allowResubmission,
  setAllowResubmission,
  discussionId,
}) => {
  const [loading, setLoading] = useState(false);

  const handleAllowResubmission = async () => {
    const newValue = !allowResubmission;
    setAllowResubmission(newValue);
    setLoading(true);

    try {
      const res = await axiosInstance.put(
        `discussion/toggleAllowResubmission/${discussionId}`,
        { allowResubmission: newValue },
      );
      fetchDiscussion();
      setAllowResubmission(res.data.allowResubmission);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update resubmission setting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center w-full h-20"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2">
          <Loader size={20} />
          <p className="text-sm text-gray-500">Updating settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
        <input
          type="checkbox"
          id="resubmission"
          checked={allowResubmission}
          onChange={handleAllowResubmission}
          className="w-5 h-5 cursor-pointer accent-blue-600"
        />
        <label
          htmlFor="resubmission"
          className="font-medium cursor-pointer select-none"
        >
          Allow Resubmission
        </label>
        <p className="text-sm text-gray-500 ml-auto">
          {allowResubmission
            ? "Students can resubmit their responses."
            : "Resubmission disabled."}
        </p>
      </div>
    </div>
  );
};

export default DiscussionAllowResubmissionSetting;
