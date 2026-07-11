import PaneltyDeductMarks from "@/CustomComponent/Assessment/assessment-setting.jsx/deductMarks-setting";
import ResubmissionSetting from "@/CustomComponent/Assessment/assessment-setting.jsx/resubmission-setting";
import BackButton from "@/CustomComponent/BackButton";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Loader, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const AssessmentSetting = () => {
  const [allowResubmission, setAllowResubmission] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  const { assessmentid } = useParams();

  const fetchAssessment = async () => {
    try {
      const res = await axiosInstance.get(`assessment/v2/${assessmentid}`);
      setAssessment(res.data.assessment);
      setAllowResubmission(res.data.assessment.allowResubmission);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, [assessmentid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin"></Loader>
      </div>
    );
  }

  return (
    <div>
      <BackButton />
      <div className="mt-5">
        <h1 className="font-bold text-2xl">Setting</h1>

        <ResubmissionSetting
          fetchAssessment={fetchAssessment}
          allowResubmission={allowResubmission}
          setAllowResubmission={setAllowResubmission}
          assessmentid={assessmentid}
        />

        <PaneltyDeductMarks
          fetchAssessment={fetchAssessment}
          assessmentid={assessmentid}
          assessment={assessment}
        />
      </div>
    </div>
  );
};

export default AssessmentSetting;
