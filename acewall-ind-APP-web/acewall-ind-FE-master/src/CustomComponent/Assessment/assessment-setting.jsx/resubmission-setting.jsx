import { axiosInstance } from "@/lib/AxiosInstance";
import { Loader } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const ResubmissionSetting = ({
  fetchAssessment,
  allowResubmission,
  setAllowResubmission,
  assessmentid,
}) => {
  const [loading, setLoading] = useState(false);

  //   console.log(allowResubmission, "allowResubmission in resubmission setting");

  const handleAllowSubmission = async () => {
    const newValue = !allowResubmission;
    setAllowResubmission(newValue);

    try {
      const res = await axiosInstance.put(
        `assessment/setAllowResubmission/${assessmentid}`,
        { allowResubmission: newValue },
      );
      fetchAssessment();
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
            id="resubmission"
            checked={allowResubmission}
            onChange={handleAllowSubmission}
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
              ? "Students can submit multiple times."
              : "No resubmission allowed."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResubmissionSetting;
