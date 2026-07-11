import DiscussionTabContent from "@/CustomComponent/Student/DiscussionTabContent";
import { axiosInstance } from "@/lib/AxiosInstance";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const StudentDiscussion = () => {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [discussions, setDiscussions] = useState([]);

  useEffect(() => {
    const fetchDiscussions = async () => {
      setLoading(true);
      await axiosInstance
        .get(`/discussion/studentDiscussion${courseId ? `?course=${courseId}` : ''}`)
        .then((res) => {
          setLoading(false);
          setDiscussions(res.data.discussions || []);
        })
        .catch(() => {
          setLoading(false);
          setDiscussions([]);
        });
    };
    fetchDiscussions();
  }, [refresh]);

  return (
    <div>
      <div className="flex flex-col pb-2 gap-5">
        <p className="text-xl py-4 mb-8 pl-6 font-semibold bg-acewall-main text-white rounded-lg">
          Discussions
        </p>
      </div>

      {/* Existing Tab Content */}
      <DiscussionTabContent loading={loading} discussions={discussions} />
    </div>
  );
};

export default StudentDiscussion;
