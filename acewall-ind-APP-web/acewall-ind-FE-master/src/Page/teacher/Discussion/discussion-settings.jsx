"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form"; // Added these
import { axiosInstance } from "@/lib/AxiosInstance";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";
import BackButton from "@/CustomComponent/BackButton";
import DueDateSetting from "./dueDate-setting";
import DiscussionAllowResubmissionSetting from "@/CustomComponent/Discussion/discussionResubmission-setting";


const DiscussionSettings = () => {
  const { id } = useParams();
  const [discussion, setDiscussion] = useState(null);
  const [allowResubmission, setAllowResubmission] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDiscussion = async () => {
    try {
      const res = await axiosInstance.get(`discussion/v2/${id}`);
      const discData = res.data.discussion;
      setDiscussion(discData);
      setAllowResubmission(discData?.allowResubmission || false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load discussion settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussion();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <BackButton />
      <div className="mt-5 px-4">
        <DueDateSetting discussion={discussion} />
        <DiscussionAllowResubmissionSetting
          fetchDiscussion={fetchDiscussion}
          allowResubmission={allowResubmission}
          setAllowResubmission={setAllowResubmission}
          discussionId={id}
        />
      </div>
    </div>
  );
};

export default DiscussionSettings;
